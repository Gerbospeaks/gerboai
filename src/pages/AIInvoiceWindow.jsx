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
  setDoc,
  runTransaction,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import logo from "../assets/img/solidflo-logo.png";
import { getIndustryConfig } from "../utils/industryConfig";
import { callClaude, extractInvoiceData } from "../utils/api";
import {
  Sparkles,
  Send,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Database,
  Download,
  Save,
  FileText,
  ArrowLeft,
  PanelRightClose,
  PanelRight,
  Receipt,
  ShoppingCart,
  Plus,
  Search,
  PanelLeft,
  Menu,
  X,
  LogOut,
  ChevronDown, 
  Trash2, 
  UserPlus, 
  Settings
} from "lucide-react";
import BusinessSettingsModal from "./BusinessSettingsModal";
import CustomerModal from "./CustomerModal";
/* ───────────────── Claude-style theme ───────────────── */
const C = {
  bg: "#1f1e1d",
  sidebar: "#262624",
  panel: "#2b2a28",
  input: "#30302e",
  hover: "rgba(255,255,255,.06)",
  active: "rgba(255,255,255,.1)",
  border: "rgba(255,255,255,.09)",
  text: "#faf9f5",
  muted: "#9c9a92",
  faint: "#6f6d66",
  accent: "#d97757",
  serif: "'Tiempos Headline','Tiempos Text',Georgia,'Times New Roman',serif",
  sans: "'DM Sans',-apple-system,'Segoe UI',system-ui,sans-serif",
};

const DOC_TYPES = [
  { id: "invoice", label: "New Invoice", short: "Invoice", icon: FileText },
  { id: "estimate", label: "New Quote", short: "Quote", icon: Receipt },
  {
    id: "purchase_order",
    label: "New Purchase Order",
    short: "Purchase Order",
    icon: ShoppingCart,
  },
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

/* ───────────────── Data ───────────────── */
// Same collections and field names the dashboard uses
const DOC_COLLECTIONS = [
  { col: "invoices", docType: "invoice" },
  { col: "quotations", docType: "estimate" },
  { col: "purchaseOrders", docType: "purchase_order" },
];

const colFor = (docType) =>
  docType === "purchase_order"
    ? "purchaseOrders"
    : docType === "estimate"
      ? "quotations"
      : "invoices";

const typeLabel = (docType) =>
  docType === "estimate"
    ? "Quote"
    : docType === "purchase_order"
      ? "PO"
      : "Invoice";

// Turn a dashboard-shaped document into one flat shape the AI window can use
const normalizeDoc = (id, d, col, docType) => {
  const isPO = col === "purchaseOrders";
  const totals = d.totals || {};
  return {
    id,
    _col: col,
    docType,
    clientId: d.clientId || null,
    number: d.jobCardNumber || d.invoiceNumber || d.poNumber || id,
    customerName:
      (isPO ? d.supplierName : d.customer?.name) || d.customerName || "",
    customerEmail: (isPO ? d.supplierEmail : d.customer?.email) || "",
    customerPhone: (isPO ? d.supplierPhone : d.customer?.phone) || "",
    customerAddress: (isPO ? d.supplierAddress : d.customer?.address) || "",
    items: (d.items || []).map((it) => ({
      ...it,
      rate: it.rate ?? it.unitPrice ?? 0,
      category: it.category || it.type || "Service",
    })),
    subtotal: totals.subtotal ?? d.subtotal ?? 0,
    totalTax: totals.vat ?? d.totalTax ?? 0,
    total: totals.total ?? d.total ?? 0,
    paymentStatus: { status: d.status || "pending" },
    dueDate: d.dueDate || d.dates?.dueDate || null,
    createdAt: d.createdAt || null,
  };
};

const tsSeconds = (t) =>
  t?.seconds ? t.seconds : t?.toDate ? t.toDate().getTime() / 1000 : 0;

// Mirrors the dashboard's counter logic so numbers never collide
const generateDocNumber = async (uid, col) => {
  const prefix =
    col === "quotations" ? "QT" : col === "purchaseOrders" ? "PO" : "JC";
  const base = col === "purchaseOrders" ? 0 : 891;
  const counterRef = doc(db, "users", uid, "counters", col);

  const counterSnap = await getDoc(counterRef);
  if (!counterSnap.exists()) {
    let max = base;
    const snap = await getDocs(collection(db, "users", uid, col));
    snap.forEach((d) => {
      const data = d.data();
      const m = (data.jobCardNumber || data.poNumber || "").match(/(\d+)$/);
      if (m && Number(m[1]) > max) max = Number(m[1]);
    });
    await setDoc(
      counterRef,
      { value: max, updatedAt: serverTimestamp() },
      { merge: true },
    );
  }

  const next = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists() ? snap.data().value || base : base;
    tx.set(
      counterRef,
      { value: current + 1, updatedAt: serverTimestamp() },
      { merge: true },
    );
    return current + 1;
  });
  return `${prefix}-${new Date().getFullYear()}-${String(next).padStart(4, "0")}`;
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
  const all = [];
  for (const { col, docType } of DOC_COLLECTIONS) {
    try {
      const snap = await getDocs(
        query(collection(db, "users", uid, col), orderBy("createdAt", "desc")),
      );
      snap.docs.forEach((d) => {
        const data = d.data();
        if (!data._placeholder)
          all.push(normalizeDoc(d.id, data, col, docType));
      });
    } catch (e) {
      console.warn(`${col}:`, e.message);
    }
  }
  result.recentInvoices = all.sort(
    (a, b) => tsSeconds(b.createdAt) - tsSeconds(a.createdAt),
  );
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
            `${i + 1}. ${typeLabel(v.docType)} #${v.number || "N/A"} client:"${v.customerName || "—"}" items:${JSON.stringify((v.items || []).slice(0, 3).map((it) => ({ d: it.description, r: it.rate, q: it.qty })))}`,
        )
        .join("\n")}`
    : "## RECENT INVOICES\nNone.";
  const docLabel =
    documentType === "estimate"
      ? "quotation"
      : documentType === "purchase_order"
        ? "purchase order"
        : "invoice";

  return `You are GerboAI AI — an expert ${docLabel} assistant for the ${industry} industry.

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

const docDate = (d) =>
  d.createdAt?.seconds
    ? new Date(d.createdAt.seconds * 1000).toLocaleDateString("en-ZA")
    : "";

const docStatus = (d) => {
  const paid = d.paymentStatus?.status === "paid";
  const overdue =
    d.dueDate &&
    !paid &&
    new Date(d.dueDate?.seconds ? d.dueDate.seconds * 1000 : d.dueDate) <
      new Date();
  return paid
    ? { label: "Paid", color: "#4ade80" }
    : overdue
      ? { label: "Overdue", color: "#f87171" }
      : { label: "Pending", color: "#fbbf24" };
};

/* ───────────────── Message ───────────────── */
function Bubble({ msg, onAddClient }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div
        className="sf-msg"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 22,
        }}
      >
        <div
          style={{
            maxWidth: "80%",
            background: C.input,
            color: C.text,
            padding: "10px 16px",
            borderRadius: 16,
            fontSize: 15,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className="sf-msg"
      style={{ display: "flex", gap: 12, marginBottom: 26 }}
    >
      <div style={{ paddingTop: 3, flexShrink: 0 }}>
        <Sparkles size={18} color={C.accent} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            color: C.text,
            fontSize: 15,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {msg.content}
        </div>
        {(msg.appliedClient || msg.appliedItems) && (
          <div
            style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}
          >
            {msg.appliedClient && (
              <span style={chip("#93c5fd")}>
                <Database size={11} /> Loaded: {msg.appliedClient}
              </span>
            )}
            {msg.appliedItems > 0 && (
              <span style={chip("#4ade80")}>
                <Check size={11} /> {msg.appliedItems} item
                {msg.appliedItems > 1 ? "s" : ""} added
              </span>
            )}
          </div>
        )}
        <button
          className="sf-icon"
          onClick={() => {
            navigator.clipboard.writeText(msg.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          style={{
            marginTop: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: C.faint,
            padding: 4,
            borderRadius: 6,
            display: "flex",
          }}
          title="Copy"
        >
          {copied ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
        </button>
        {msg.clientSaved && (
          <div style={{ ...chip("#4ade80"), marginTop: 6 }}>
            <Check size={11} /> Client saved to your contacts!
          </div>
        )}
        {msg.newClientName && onAddClient && (
  <button className="sf-chip" onClick={() => onAddClient(msg.newClientName)} style={{ ...chipBtn, marginTop: 8 }}>
    + Add {msg.newClientName} as a client
  </button>
)}
      </div>
    </div>
  );
}

const chip = (color) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  fontSize: 11.5,
  fontWeight: 600,
  color,
  padding: "3px 10px",
  borderRadius: 20,
  border: `1px solid ${color}40`,
  background: `${color}14`,
});

function TypingDots() {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        marginBottom: 24,
        alignItems: "center",
      }}
    >
      <Sparkles
        size={18}
        color={C.accent}
        style={{ animation: "sfPulse 1.4s ease-in-out infinite" }}
      />
      <div style={{ display: "flex", gap: 5 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: C.muted,
              animation: `sfBounce 1.2s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ───────────────── Sidebar (Claude style: New / nav / Recents) ───────────────── */
function Sidebar({
  collapsed,
  onToggle,
  isMobile,
  onClose,
  documentType,
  onChangeType,
  onNew,
  onExit,
  docs,
  selectedDoc,
  onSelectDoc,
  user,
  businessInfo,
  onLogout,
  onAddCustomer,
  onOpenSettings,
}) {
  const [showAll, setShowAll] = useState(false);
  const [q, setQ] = useState("");
  const narrow = collapsed && !isMobile;

  const filtered = docs.filter(
    (d) =>
      !q ||
      [d.customerName, d.number].some((f) =>
        f?.toString().toLowerCase().includes(q.toLowerCase()),
      ),
  );
  const list = showAll ? filtered : filtered.slice(0, 6);

  const row = (active) => ({
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: narrow ? "9px 0" : "8px 10px",
    justifyContent: narrow ? "center" : "flex-start",
    borderRadius: 8,
    border: "none",
    background: active ? C.active : "transparent",
    color: C.text,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "inherit",
    textAlign: "left",
  });

  const initial = (user?.name || user?.email || "?")[0].toUpperCase();

  return (
    <div
      style={{
        width: isMobile ? 290 : narrow ? 56 : 264,
        flexShrink: 0,
        background: C.sidebar,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "width .22s ease",
        overflow: "hidden",
      }}
    >
      {/* header */}
      <div
        style={{
          height: 54,
          display: "flex",
          alignItems: "center",
          justifyContent: narrow ? "center" : "space-between",
          padding: narrow ? 0 : "0 12px",
          flexShrink: 0,
        }}
      >
        {!narrow && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
           
            <span
              style={{
                fontFamily: C.serif,
                fontSize: 21,
                fontWeight: 500,
                color: C.text,
              }}
            >
              Gerbo
            </span>
          </div>
        )}
        <button
          className="sf-icon"
          onClick={isMobile ? onClose : onToggle}
          style={{
            background: "none",
            border: "none",
            color: C.muted,
            cursor: "pointer",
            padding: 6,
            borderRadius: 6,
            display: "flex",
          }}
          title={isMobile ? "Close" : "Toggle sidebar"}
        >
          {isMobile ? <X size={18} /> : <PanelLeft size={18} />}
        </button>
      </div>

      {/* primary actions */}
      <div style={{ padding: "4px 8px" }}>
        <button
          className="sf-row"
          onClick={onNew}
          style={{ ...row(false), background: C.active }}
          title="New"
        >
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: C.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Plus size={13} color="#fff" strokeWidth={3} />
          </span>
          {!narrow && "New chat"}
        </button>

        {DOC_TYPES.map((t) => {
          const Icon = t.icon;
          const active = documentType === t.id;
          return (
            <button
              key={t.id}
              className="sf-row"
              onClick={() => onChangeType(t.id)}
              title={narrow ? t.label : undefined}
              style={{
                ...row(false),
                color: active ? C.text : C.muted,
                marginTop: 2,
              }}
            >
              <Icon
                size={17}
                color={active ? C.accent : C.muted}
                style={{ flexShrink: 0 }}
              />
              {!narrow && (
                <>
                  <span style={{ flex: 1 }}>{t.label}</span>
                  {active && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: C.accent,
                      }}
                    />
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* recents */}
      {!narrow ? (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            padding: "16px 8px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "0 10px 6px",
              fontSize: 12,
              fontWeight: 600,
              color: C.muted,
            }}
          >
            Recents <ChevronDown size={12} />
          </div>

          {showAll && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                margin: "0 4px 8px",
                padding: "6px 10px",
                borderRadius: 8,
                background: C.input,
              }}
            >
              <Search size={13} color={C.muted} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search recents…"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "none",
                  color: C.text,
                  fontSize: 13,
                  fontFamily: "inherit",
                }}
              />
            </div>
          )}

          <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            {list.length === 0 ? (
              <div
                style={{ padding: "8px 10px", fontSize: 13, color: C.faint }}
              >
                Nothing yet — create your first document.
              </div>
            ) : (
              list.map((d, i) => {
                const st = docStatus(d);
                const active = selectedDoc?.id === d.id;
                const tLabel = typeLabel(d.docType);
                return (
                  <button
                    key={d.id || i}
                    className="sf-row"
                    onClick={() => onSelectDoc(d)}
                    style={{
                      ...row(active),
                      padding: "7px 10px",
                      fontWeight: 400,
                      gap: 8,
                      display: "flex",
                    }}
                    title={`${tLabel} #${d.number || ""}`}
                  >
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: active ? C.text : "rgba(250,249,245,.85)",
                      }}
                    >
                      {d.customerName || "Unknown client"}
                      <span style={{ color: C.faint }}>
                        {" "}
                        · {tLabel} {d.number ? `#${d.number}` : ""}
                      </span>
                    </span>
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: st.color,
                        flexShrink: 0,
                      }}
                      title={st.label}
                    />
                  </button>
                );
              })
            )}
            {filtered.length > 6 && (
              <button
                className="sf-row"
                onClick={() => setShowAll((s) => !s)}
                style={{
                  ...row(false),
                  color: C.muted,
                  padding: "7px 10px",
                  fontWeight: 400,
                }}
              >
                {showAll ? "Show less" : "View all"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1 }} />
      )}

      {/* footer */}
      <div
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: narrow ? "10px 0" : "10px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <button
  className="sf-row"
  onClick={onAddCustomer}
  style={{ ...row(false), color: C.muted }}
  title="Add customer"
>
  <UserPlus size={17} style={{ flexShrink: 0 }} />
  {!narrow && "Add customer"}
</button>
<button
  className="sf-row"
  onClick={onOpenSettings}
  style={{ ...row(false), color: C.muted }}
  title="Business settings"
>
  <Settings size={17} style={{ flexShrink: 0 }} />
  {!narrow && "Business settings"}
</button>
        <button
          className="sf-row"
          onClick={onExit}
          style={{ ...row(false), color: C.muted }}
          title="Back to dashboard"
        >
          <ArrowLeft size={17} style={{ flexShrink: 0 }} />
          {!narrow && "Back to dashboard"}
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: narrow ? 0 : "4px 10px",
            justifyContent: narrow ? "center" : "flex-start",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#c8c6bd",
              color: "#1f1e1d",
              fontWeight: 700,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          {!narrow && (
            <>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.text,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {businessInfo?.businessName || user?.name || "Account"}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: C.muted,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.email}
                </div>
              </div>
              <button
                className="sf-icon"
                onClick={onLogout}
                title="Sign out"
                style={{
                  background: "none",
                  border: "none",
                  color: C.muted,
                  cursor: "pointer",
                  padding: 6,
                  borderRadius: 6,
                  display: "flex",
                }}
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────── MAIN ───────────────── */
export default function AIInvoiceWindow({
  user,
  onExit,
  onNavigateTo,
  documentType: initDocType = "invoice",
  TemplateRenderer,
  POTemplateRenderer,
  industry = "default",
  quoteType = "quote",
}) {
  const [userData, setUserData] = useState(null);
  const [extraData, setExtraData] = useState({});
  const [dataLoading, setDataLoading] = useState(true);
  const templateDocType = (t) => (t === "estimate" ? quoteType : t);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
const [showSettings, setShowSettings] = useState(false);
const [customerPrefill, setCustomerPrefill] = useState(null);
const dismissedRef = useRef(new Set()); 
  const [documentType, setDocumentType] = useState(
    initDocType === "quote"
      ? "estimate"
      : DOC_TYPES.some((d) => d.id === initDocType)
        ? initDocType
        : "invoice",
  );
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [billName, setBillName] = useState("");
  const [billEmail, setBillEmail] = useState("");
  const [billPhone, setBillPhone] = useState("");
  const [billAddress, setBillAddress] = useState("");
  const [items, setItems] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedNumber, setSavedNumber] = useState(null);
  const savedDocRef = useRef(null); // { id, number, col } once this draft has been saved
  const [selectedDoc, setSelectedDoc] = useState(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState("chat");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const historyRef = useRef([]);
  const msgCounter = useRef(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
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
  const invoiceNumber = useRef(
    `DRAFT-${Date.now().toString(36).toUpperCase()}`,
  ).current;

  const loadData = useCallback(async () => {
    if (!user?.uid) return;
    setDataLoading(true);
    try {
      setUserData(await loadAllUserData(user.uid));
    } finally {
      setDataLoading(false);
    }
  }, [user?.uid]);

 const refreshData = useCallback(async () => {
  if (!user?.uid) return null;
  try {
    const data = await loadAllUserData(user.uid);
    setUserData(data);
    return data;
  } catch (e) {
    console.warn("refresh:", e.message);
    return null;
  }
}, [user?.uid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const WELCOME = {
    id: "welcome",
    role: "assistant",
    content:
      "Hi! I'm GerboAI AI. Choose a document type then describe what you need. When you mention a saved client I'll load their details from your database instantly.",
  };

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
          setMessages([WELCOME]);
        }
      } catch (e) {
        console.error(e);
        setMessages([WELCOME]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const resetDoc = useCallback(() => {
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
    setExtraData({});
    setClientId(null);
    setSavedNumber(null);
    savedDocRef.current = null;
  }, []);

  useEffect(() => {
    resetDoc();
  }, [documentType, resetDoc]);

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
    setClientId(client.id || null);
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
    const trimmed = (typeof override === "string" ? override : input).trim();
    if (!trimmed || loading) return;

    const firebaseUser = getAuth().currentUser;
    const userToken = firebaseUser ? await firebaseUser.getIdToken() : null;
    if (!userToken) {
      setError("Session expired. Please sign in again.");
      return;
    }

    setInput("");
    setError("");
    setSelectedDoc(null);
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
      const lastDoc =
        userData?.recentInvoices?.find((d) => d.docType === documentType) ||
        null;
      if (isRepeat && lastDoc) {
        if (lastDoc.customerName) {
          setClientId(lastDoc.clientId || null);
          setCustomerName(lastDoc.customerName);
          setCustomerEmail(lastDoc.customerEmail);
          setCustomerPhone(lastDoc.customerPhone);
          setCustomerAddress(lastDoc.customerAddress);
          setBillName(lastDoc.customerName);
          setBillEmail(lastDoc.customerEmail);
          setBillPhone(lastDoc.customerPhone);
          setBillAddress(lastDoc.customerAddress);
          if (!appliedClient) appliedClient = lastDoc.customerName;
        }
        if (lastDoc.items?.length) applyItems(lastDoc.items);
      }

      // chat reply + structured extraction in parallel
      const [rawText, extractedDirect] = await Promise.all([
        callClaude({
          system: buildPrompt(userData, documentType, industry),
          messages: historyRef.current,
        }),
        extractInvoiceData(trimmed),
      ]);

      const { reply, data: extracted } = parseResponse(rawText);

      if (extractedDirect?.line_items?.length) {
        applyItems(
          extractedDirect.line_items.map((i) => ({
            description: i.description,
            rate: i.rate,
            qty: i.quantity,
            amount: i.amount,
            taxRate: 15,
            category: "Service",
          })),
        );
      }
      if (
        extractedDirect?.client_name &&
        !extracted?.matchedClientId &&
        !mentionedClient &&
        !isRepeat
      ) {
        setClientId(null);
        setCustomerName(extractedDirect.client_name);
        setCustomerEmail(extractedDirect.client_email || "");
        setCustomerPhone(extractedDirect.client_phone || "");
        setCustomerAddress(extractedDirect.client_address || "");
      }

      let appliedItems = 0;

      if (extracted) {
        const config = getIndustryConfig(industry);
        Object.keys(config.extraFields || {}).forEach((key) => {
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
        // New client: fill the document now; Save adds them to your clients automatically
        if (
          extracted.clientNotInDB?.name &&
          !mentionedClient &&
          !extracted.matchedClientId
        ) {
          const nc = extracted.clientNotInDB;
          setClientId(null);
          setCustomerName(nc.name || "");
          setCustomerEmail(nc.email || "");
          setCustomerPhone(nc.phone || "");
          setCustomerAddress(nc.address || "");
          setBillName(nc.name || "");
          setBillEmail(nc.email || "");
          setBillPhone(nc.phone || "");
          setBillAddress(nc.address || "");
          appliedClient = nc.name;
        }
        if (extracted.repeatLastInvoice && lastDoc && !isRepeat) {
          if (lastDoc.items?.length) appliedItems = applyItems(lastDoc.items);
        }
      }
     
let newClient = null;
if (
  documentType !== "purchase_order" &&
  !mentionedClient &&
  !isRepeat &&
  !extracted?.matchedClientId
) {
  if (extracted?.clientNotInDB?.name) {
    newClient = extracted.clientNotInDB;
  } else if (extractedDirect?.client_name) {
    newClient = {
      name: extractedDirect.client_name,
      email: extractedDirect.client_email || "",
      phone: extractedDirect.client_phone || "",
      address: extractedDirect.client_address || "",
    };
  }
}
const alreadySaved = newClient && userData?.clients?.some(
  (c) => c.name?.trim().toLowerCase() === newClient.name.trim().toLowerCase(),
);
if (alreadySaved) newClient = null;
      const aiMsg = {
        id: `a-${++msgCounter.current}`,
        role: "assistant",
        content: reply || "Got it — I've updated your document.",
        rawContent: rawText,
        appliedClient,
        appliedItems: appliedItems || null,
        newClientName: newClient?.name || null,
      };
      setMessages((prev) => [...prev, aiMsg]);
      historyRef.current = [
        ...historyRef.current,
        { role: "assistant", content: rawText },
      ];
      await saveMsg({ ...aiMsg, showSavePrompt: false });
      if (newClient && !dismissedRef.current.has(newClient.name.trim().toLowerCase())) {
  setCustomerPrefill(newClient);
  setShowCustomerModal(true);
}
    } catch (e) {
      setError(e.message || "Something went wrong. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Find the saved client for this document, or create one (never duplicates by name)
  const ensureClient = async () => {
    if (clientId) return { id: clientId, created: false };
    const name = customerName.trim();
    const found = userData?.clients?.find(
      (c) => c.name?.trim().toLowerCase() === name.toLowerCase(),
    );
    if (found) {
      setClientId(found.id);
      return { id: found.id, created: false };
    }
    const ref = await addDoc(collection(db, "users", user.uid, "clients"), {
      name,
      email: customerEmail || "",
      phone: customerPhone || "",
      address: customerAddress || "",
      tax_id: taxId || "",
      merchant_code: "",
      source: "ai-invoice",
      createdAt: serverTimestamp(),
    });
    setClientId(ref.id);
    return { id: ref.id, created: true };
  };

  const saveDocument = async () => {
    if (!user?.uid || saving || (!customerName.trim() && !safeItems.length))
      return;
    setSaving(true);
    setError("");
    try {
      const isPO = documentType === "purchase_order";
      const col = colFor(documentType);
      const existing = savedDocRef.current;
      const number =
        existing?.number || (await generateDocNumber(user.uid, col));
      const docId = existing?.id || number;

      let cid = null;
      let clientCreated = false;
      if (!isPO && customerName.trim()) {
        const res = await ensureClient();
        cid = res.id;
        clientCreated = res.created;
      }

      const base = existing ? {} : { createdAt: serverTimestamp() };
      let payload;

      if (isPO) {
        payload = {
          ...base,
          poNumber: number,
          poDate: new Date().toLocaleDateString("en-ZA"),
          deliveryDate: "",
          supplierName: customerName,
          supplierContact: "",
          supplierEmail: customerEmail,
          supplierPhone: customerPhone,
          supplierAddress: customerAddress,
          deliveryName: "",
          deliveryAddress: "",
          items: safeItems.map((i) => ({
            description: i.description,
            qty: i.qty,
            unit: "ea",
            unitPrice: i.rate,
            amount: i.amount,
          })),
          totals: { subtotal, vat: totalTax, total },
          notes: "",
          paymentTerms: "30 Days",
          shippingMethod: "",
          status: "pending",
          source: "ai",
          updatedAt: serverTimestamp(),
        };
      } else {
        payload = {
          ...base,
          jobCardNumber: number,
          locked: true,
          status: "pending",
          documentType: documentType === "estimate" ? quoteType : "invoice",
          clientId: cid,
          dates: { serviceDate: new Date().toISOString(), completedDate: null },
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: customerAddress,
            merchant_code: "",
          },
          billTo: {
            name: billName || customerName,
            email: billEmail || customerEmail,
            phone: billPhone || customerPhone,
            address: billAddress || customerAddress,
          },
          items: safeItems.map((i) => ({
            description: i.description,
            type: i.category === "Parts" ? "Parts" : "Labor",
            category: i.category,
            rate: i.rate,
            qty: i.qty,
            amount: i.amount,
            taxRate: i.taxRate,
          })),
          vatRate: safeItems[0]?.taxRate || 0,
          totals: { subtotal, vat: totalTax, total, paid: 0, due: total },
          source: "ai",
          updatedAt: serverTimestamp(),
        };
      }

      await setDoc(doc(db, "users", user.uid, col, docId), payload, {
        merge: true,
      });

      savedDocRef.current = { id: docId, number, col };
      setSavedNumber(number);

      const aiMsg = {
        id: `sv-${Date.now()}`,
        role: "assistant",
        content: `Saved ${typeLabel(documentType).toLowerCase()} ${number}${
          clientCreated ? ` and added ${customerName} to your clients` : ""
        }. You'll find it under Recents.`,
        clientSaved: clientCreated,
      };
      setMessages((prev) => [...prev, aiMsg]);
      await saveMsg(aiMsg);
      await refreshData();
    } catch (e) {
      console.error("saveDocument:", e);
      setError(e.message || "Could not save. Please try again.");
    } finally {
      setSaving(false);
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

  const startNew = () => {
    setMessages([WELCOME]);
    historyRef.current = [];
    setSelectedDoc(null);
    setError("");
    resetDoc();
    setDrawerOpen(false);
    if (isMobile) setMobileTab("chat");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const changeType = (type) => {
    setDocumentType(type);
    setSelectedDoc(null);
    setDrawerOpen(false);
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        role: "assistant",
        content: `Switched to ${DOC_TYPES.find((d) => d.id === type)?.label}. What would you like to create?`,
      },
    ]);
  };

  const openDoc = (d) => {
    setSelectedDoc(d);
    setPreviewOpen(true);
    setDrawerOpen(false);
    if (isMobile) setMobileTab("preview");
  };

  const hasContent = customerName || safeItems.length > 0;
  const activeDt = DOC_TYPES.find((d) => d.id === documentType) || DOC_TYPES[0];
  const bizInfo = userData?.businessInfo;
  const suggestions = SUGGESTIONS[documentType] || SUGGESTIONS.invoice;
  const firstName = (user?.name || user?.displayName || "").split(" ")[0];
  const isEmpty = messages.every((m) => m.id === "welcome") && !loading;

 const templateProps = {
  templateId: userData?.activeTemplate || "professional",
  businessInfo: bizInfo,
  loading: false,
  jobCardNumber: invoiceNumber,
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
  vat: safeNum(totalTax),          
  totalTax: safeNum(totalTax),
  total: safeNum(total),
  documentType: templateDocType(documentType),
  showStamp: false,
  paymentStatus: { status: "pending" },
  totalPaid: 0,                    
  balanceDue: safeNum(total),
  paymentStatusLabel: "pending",
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
          background: C.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          fontFamily: C.sans,
        }}
      >
        <Sparkles
          size={30}
          color={C.accent}
          style={{ animation: "sfPulse 1.4s ease-in-out infinite" }}
        />
        <div style={{ fontFamily: C.serif, fontSize: 24, color: C.text }}>
          GerboAI AI
        </div>
        <div
          style={{
            fontSize: 13,
            color: C.muted,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Loader2
            size={14}
            style={{ animation: "sfSpin 1s linear infinite" }}
          />
          Loading your template, clients and business data…
        </div>
        <style>{`@keyframes sfSpin{to{transform:rotate(360deg)}}@keyframes sfPulse{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
      </div>
    );

  /* ── Composer (Claude-style rounded input box) ── */
  const composer = (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>
      <div
        style={{
          background: C.input,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: "14px 14px 10px 18px",
          boxShadow: "0 4px 24px rgba(0,0,0,.25)",
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
              : "Describe your document in plain English…"
          }
          rows={2}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            outline: "none",
            resize: "none",
            color: C.text,
            fontSize: 15.5,
            fontFamily: "inherit",
            lineHeight: 1.6,
            maxHeight: 160,
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: C.muted,
              fontSize: 12.5,
            }}
          >
            <activeDt.icon size={14} color={C.accent} /> {activeDt.short}
            {userData?.clients?.length > 0 && (
              <span style={{ color: C.faint }}>
                · {userData.clients.length} clients loaded
              </span>
            )}
          </div>
          <button
            className="sf-send"
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: C.accent,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Send"
          >
            {loading ? (
              <Loader2
                size={16}
                color="#fff"
                style={{ animation: "sfSpin 1s linear infinite" }}
              />
            ) : (
              <Send size={16} color="#fff" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Chat column ── */
  const chatColumn = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minWidth: 0,
        background: C.bg,
      }}
    >
      {/* top bar */}
      <div
        style={{
          height: 54,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}
        >
          {isMobile && (
            <button
              className="sf-icon"
              onClick={() => setDrawerOpen(true)}
              style={iconBtn}
            >
              <Menu size={20} />
            </button>
          )}
          <span style={{ fontSize: 14, color: C.muted, whiteSpace: "nowrap" }}>
            {activeDt.short} ·{" "}
            <span style={{ color: C.text }}>GerboAI AI</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isMobile ? (
            <div
              style={{
                display: "flex",
                background: C.input,
                borderRadius: 10,
                padding: 3,
              }}
            >
              {["chat", "preview"].map((t) => (
                <button
                  key={t}
                  onClick={() => setMobileTab(t)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12.5,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    background: mobileTab === t ? C.active : "transparent",
                    color: mobileTab === t ? C.text : C.muted,
                    textTransform: "capitalize",
                  }}
                >
                  {t}
                  {t === "preview" && hasContent && (
                    <span style={{ marginLeft: 5, color: "#4ade80" }}>•</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <button
              className="sf-row"
              onClick={() => setPreviewOpen((o) => !o)}
              style={pillBtn}
            >
              {previewOpen ? (
                <PanelRightClose size={15} />
              ) : (
                <PanelRight size={15} />
              )}
              {previewOpen ? "Hide preview" : "Show preview"}
            </button>
          )}
        </div>
      </div>

      {isEmpty ? (
        /* ── Claude-style empty state ── */
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 18px 60px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 26,
            }}
          >
            <Sparkles size={isMobile ? 26 : 32} color={C.accent} />
            <h1
              style={{
                margin: 0,
                fontFamily: C.serif,
                fontWeight: 400,
                fontSize: isMobile ? 28 : 38,
                color: C.text,
                letterSpacing: "-.01em",
                textAlign: "center",
              }}
            >
              {firstName
                ? `Ready to bill, ${firstName}?`
                : "What are we billing today?"}
            </h1>
          </div>
          {composer}

          {error && <ErrorBox error={error} />}

          <div style={{ width: "100%", maxWidth: 720, marginTop: 26 }}>
            {userData?.clients?.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={sectionLabel}>Your saved clients</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {userData.clients.slice(0, isMobile ? 4 : 6).map((c) => (
                    <button
                      key={c.id}
                      className="sf-chip"
                      onClick={() => {
                        applyClientFromDB(c);
                        send(
                          `${documentType === "purchase_order" ? "Purchase order from" : documentType === "estimate" ? "Quote for" : "Invoice"} ${c.name} for `,
                        );
                      }}
                      style={chipBtn}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={sectionLabel}>Try one of these</div>
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="sf-chip"
                onClick={() => send(s)}
                style={{
                  ...chipBtn,
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  marginBottom: 8,
                  borderRadius: 12,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: isMobile ? "10px 14px" : "10px 22px",
            }}
          >
            <div style={{ maxWidth: 720, margin: "0 auto", paddingTop: 10 }}>
              {messages.map((msg, i) => (
                <Bubble key={msg.id || i} msg={msg}
  onAddClient={(name) => {
    setCustomerPrefill({ name, email: customerEmail, phone: customerPhone, address: customerAddress });
    setShowCustomerModal(true);
  }} />
              ))}
              {loading && <TypingDots />}
              {error && <ErrorBox error={error} />}
              <div ref={bottomRef} />
            </div>
          </div>
          <div
            style={{
              padding: isMobile ? "6px 12px 12px" : "6px 22px 18px",
              flexShrink: 0,
            }}
          >
            {composer}
            <div
              style={{
                textAlign: "center",
                fontSize: 11,
                color: C.faint,
                marginTop: 8,
              }}
            >
              GerboAI AI can make mistakes. Check amounts before sending.
            </div>
          </div>
        </>
      )}
    </div>
  );

  /* ── Preview (Claude artifact-style card) ── */
  const showingSaved = !!selectedDoc;
  const previewTitle = showingSaved
    ? `${selectedDoc.customerName || "Document"} · #${selectedDoc.number || ""}`
    : `${activeDt.label.replace("New ", "")} preview`;

  const previewColumn = (
    <div
      style={{
        height: "100%",
        padding: isMobile ? 0 : "10px 10px 10px 0",
        background: C.bg,
        minWidth: 0,
      }}
    >
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: C.panel,
          border: isMobile ? "none" : `1px solid ${C.border}`,
          borderRadius: isMobile ? 0 : 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 50,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "0 12px 0 16px",
            borderBottom: `1px solid ${C.border}`,
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
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: C.text,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {previewTitle}
            </span>
            {(hasContent || showingSaved) && (
              <span style={chip("#4ade80")}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#4ade80",
                  }}
                />
                {showingSaved ? "Saved" : "Live"}
              </span>
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
            {showingSaved && (
              <button
                className="sf-row"
                onClick={() => setSelectedDoc(null)}
                style={pillBtn}
              >
                <ArrowLeft size={14} /> Draft
              </button>
            )}
            <button className="sf-row" onClick={handlePrint} style={pillBtn}>
              <Download size={14} /> {isMobile ? "PDF" : "Download PDF"}
            </button>
            {!showingSaved && (
              <button
                onClick={saveDocument}
                disabled={!hasContent || saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: hasContent ? C.accent : C.input,
                  border: "none",
                  color: hasContent ? "#fff" : C.faint,
                  cursor: hasContent && !saving ? "pointer" : "not-allowed",
                  fontSize: 12.5,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <Loader2
                    size={13}
                    style={{ animation: "sfSpin 1s linear infinite" }}
                  />
                ) : savedNumber ? (
                  <Check size={13} />
                ) : (
                  <Save size={13} />
                )}
                {saving ? "Saving…" : savedNumber ? "Saved" : "Save"}
              </button>
            )}
            {!isMobile && (
              <button
                className="sf-icon"
                onClick={() => setPreviewOpen(false)}
                style={iconBtn}
                title="Close preview"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: isMobile ? "14px 10px" : "22px 18px",
            display: "flex",
            justifyContent: "center",
            alignItems: !hasContent && !showingSaved ? "center" : "flex-start",
          }}
        >
          {!hasContent && !showingSaved ? (
            <div style={{ textAlign: "center", maxWidth: 320 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: C.input,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <activeDt.icon size={24} color={C.muted} />
              </div>
              <div
                style={{
                  fontFamily: C.serif,
                  fontSize: 20,
                  color: C.text,
                  marginBottom: 6,
                }}
              >
                Your {activeDt.short.toLowerCase()} will appear here
              </div>
              <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>
                {userData?.clients?.length
                  ? `Type a client name — I'll load their details from your ${userData.clients.length} saved contacts instantly.`
                  : "Describe who you're billing and what for."}
              </div>
            </div>
          ) : (
            <div
  id="ai-print-area"
  style={{
    width: "100%",
    maxWidth: 760,
    background: "#fff",
    color: "#1e293b",          // ← dark text for the paper
    colorScheme: "light",      // ← keeps form controls/scrollbars light inside
    borderRadius: 8,
    boxShadow: "0 8px 32px rgba(0,0,0,.4)",
    overflow: "hidden",
    animation: "sfSlide .3s ease",
    alignSelf: "flex-start",
  }}
>
              {(() => {
                const viewType = showingSaved
                  ? selectedDoc.docType
                  : documentType;
                const Renderer =
                  viewType === "purchase_order" && POTemplateRenderer
                    ? POTemplateRenderer
                    : TemplateRenderer;
                if (!Renderer) return null;
                if (!showingSaved) return <Renderer {...templateProps} />;
                const sd = selectedDoc;
                const sitems = sd.items.map((it) => {
                  const rate = safeNum(it.rate);
                  const qty = safeNum(it.qty) || 1;
                  const amount = safeNum(it.amount) || rate * qty;
                  const taxRate = safeNum(it.taxRate);
                  const taxAmount = amount * (taxRate / 100);
                  return {
                    ...it,
                    rate,
                    qty,
                    amount,
                    taxRate,
                    taxAmount,
                    totalAmount: amount + taxAmount,
                  };
                });
                return (
                  <Renderer
                    {...templateProps}
                    customerName={sd.customerName}
                    billName={sd.customerName}
                    customerEmail={sd.customerEmail}
                    billEmail={sd.customerEmail}
                    customerPhone={sd.customerPhone}
                    billPhone={sd.customerPhone}
                    customerAddress={sd.customerAddress}
                    billAddress={sd.customerAddress}
                    items={sitems}
                    subtotal={safeNum(sd.subtotal)}
                    totalTax={safeNum(sd.totalTax)}
                    total={safeNum(sd.total)}
                    invoiceNumber={sd.number}
                    documentType={templateDocType(sd.docType)}
                    paymentStatus={sd.paymentStatus}
                    showStamp={sd.paymentStatus?.status === "paid"}
                    stampText="PAID"
                    stampColor="#16a34a"
                  />
                );
              })() || (
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

        {hasContent && !showingSaved && (
          <div
            style={{
              height: 38,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 14px",
              borderTop: `1px solid ${C.border}`,
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: C.faint,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                whiteSpace: "nowrap",
              }}
            >
              On template
            </span>
            {[
              customerName && { label: "Client", val: customerName },
              safeItems.length > 0 && {
                label: "Items",
                val: `${safeItems.length}`,
              },
              total > 0 && { label: "Total", val: `R${total.toFixed(2)}` },
            ]
              .filter(Boolean)
              .map((it, i) => (
                <span
                  key={i}
                  style={{
                    padding: "2px 9px",
                    background: C.input,
                    borderRadius: 6,
                    whiteSpace: "nowrap",
                    fontSize: 11.5,
                    color: C.text,
                  }}
                >
                  <span style={{ color: C.muted }}>{it.label}: </span>
                  {it.val}
                </span>
              ))}
          </div>
        )}
      </div>
    </div>
  );

  const sidebar = (mobile) => (
    <Sidebar
      collapsed={sidebarCollapsed}
      onToggle={() => setSidebarCollapsed((o) => !o)}
      isMobile={mobile}
      onClose={() => setDrawerOpen(false)}
      documentType={documentType}
      onChangeType={changeType}
      onNew={startNew}
      onExit={() => {
        onExit?.();
      }}
      docs={userData?.recentInvoices || []}
      selectedDoc={selectedDoc}
      onSelectDoc={openDoc}
      user={user}
      businessInfo={bizInfo}
      onLogout={() => signOut(getAuth())}
      onAddCustomer={() => { setDrawerOpen(false); setShowCustomerModal(true); }}
  onOpenSettings={() => { setDrawerOpen(false); setShowSettings(true); }}
    />
  );

const handleCustomerSaved = async () => {
  const data = await refreshData();
  if (!customerPrefill || !data) return;
  const wanted = customerPrefill.name?.trim().toLowerCase();
  // Match by name; if the user edited the name in the modal, fall back to the newest client
  const saved =
    data.clients.find((c) => c.name?.trim().toLowerCase() === wanted) ||
    data.clients[0];
  if (saved) applyClientFromDB(saved); // fills the preview with the saved details and id
};

const setCustomerModalOpen = (open) => {
  setShowCustomerModal(open);
  if (!open && customerPrefill) {
    dismissedRef.current.add(customerPrefill.name.trim().toLowerCase());
    setCustomerPrefill(null);
  }
};
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        background: C.bg,
        color: C.text,
        fontFamily: C.sans,
      }}
    >
      <style>{`
        @keyframes sfBounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-4px);opacity:1}}
        @keyframes sfSpin{to{transform:rotate(360deg)}}
        @keyframes sfPulse{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes sfSlide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .sf-msg{animation:sfSlide .22s ease}
        .sf-row:hover{background:${C.hover}!important}
        .sf-icon:hover{background:${C.hover}!important;color:${C.text}!important}
        .sf-chip:hover{background:${C.input}!important;border-color:rgba(255,255,255,.2)!important;color:${C.text}!important}
        .sf-send:hover:not(:disabled){filter:brightness(1.1)}
        .sf-send:disabled{opacity:.4;cursor:not-allowed!important}
        textarea::placeholder,input::placeholder{color:${C.faint}}
        *{scrollbar-width:thin;scrollbar-color:#4a4946 transparent}
      `}</style>

      {isMobile ? (
        <>
          <div style={{ flex: 1, minWidth: 0, height: "100%" }}>
            {mobileTab === "chat" ? chatColumn : previewColumn}
          </div>
          {drawerOpen && (
            <>
              <div
                onClick={() => setDrawerOpen(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,.6)",
                  zIndex: 300,
                }}
              />
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  zIndex: 301,
                }}
              >
                {sidebar(true)}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {sidebar(false)}
          <div
            style={{
              flex: previewOpen ? "0 0 46%" : 1,
              minWidth: 340,
              height: "100%",
              transition: "flex-basis .25s ease",
            }}
          >
            {chatColumn}
          </div>
          {previewOpen && (
            <div style={{ flex: 1, minWidth: 0, height: "100%" }}>
              {previewColumn}
            </div>
          )}
        </>
      )}
    {/* Own stacking context so the modals sit above this window (z-index 200) */}
<div style={{ position: "relative", zIndex: 400 }}>
  {showSettings && (
    <BusinessSettingsModal
      onClose={() => {
        setShowSettings(false);
        refreshData(); // pick up new business name, VAT number, logo
      }}
    />
  )}
 <CustomerModal
  showModal={showCustomerModal}
  setShowModal={setCustomerModalOpen}
  existingCustomer={customerPrefill}
  onCustomerSaved={handleCustomerSaved}
/>
</div>
    </div>
  );
}

/* ── small shared bits ── */
const iconBtn = {
  background: "none",
  border: "none",
  color: C.muted,
  cursor: "pointer",
  padding: 6,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
};

const pillBtn = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  borderRadius: 8,
  background: "transparent",
  border: `1px solid ${C.border}`,
  color: C.text,
  cursor: "pointer",
  fontSize: 12.5,
  fontWeight: 600,
  fontFamily: "inherit",
};

const chipBtn = {
  padding: "8px 14px",
  borderRadius: 20,
  background: "transparent",
  border: `1px solid ${C.border}`,
  color: C.muted,
  cursor: "pointer",
  fontSize: 13.5,
  fontFamily: "inherit",
  lineHeight: 1.4,
  transition: "all .15s",
};

const sectionLabel = {
  fontSize: 12,
  fontWeight: 600,
  color: C.muted,
  marginBottom: 8,
  paddingLeft: 2,
};

function ErrorBox({ error }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 12,
        margin: "14px auto 0",
        maxWidth: 720,
        background: "rgba(248,113,113,.1)",
        border: "1px solid rgba(248,113,113,.3)",
        color: "#fca5a5",
        fontSize: 13,
      }}
    >
      <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
    </div>
  );
}
