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
import { getAuth, signOut } from 'firebase/auth';
import logo from "../assets/img/solidflo-logo.png";
import {
  Sparkles,
  Send,
  RotateCcw,
  User,
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
  Lightbulb,
} from "lucide-react";
import { callClaude } from "../utils/api";
import CustomerModal from "./CustomerModal";
const DOC_TYPES = [
  {
    id: "invoice",
    label: "Invoice",
    sublabel: "Bill a client",
    icon: FileText,
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  {
    id: "estimate",
    label: "Quotation",
    sublabel: "Send a quote",
    icon: Receipt,
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  {
    id: "purchase_order",
    label: "Purchase Order",
    sublabel: "Order from supplier",
    icon: ShoppingCart,
    color: "#059669",
    bg: "#f0fdf4",
    border: "#bbf7d0",
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

/* ─────────────────────────────────────────────────────────────────
   SYSTEM PROMPT
───────────────────────────────────────────────────────────────────*/
const buildPrompt = (userData, documentType) => {
  const b = userData?.businessInfo;
  const inv = userData?.recentInvoices;
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

  return `You are SolidFlo AI — an expert ${docLabel} assistant.

NOTE: Client fields are auto-filled from Firebase when a client is matched. You only need to return clientNotInDB if the client is genuinely new.

${bizBlock}
${clientList}
${invBlock}

## CURRENT DOCUMENT TYPE: ${documentType.toUpperCase()}

ALWAYS respond with:
1. 1–2 sentence friendly reply
2. JSON block:

\`\`\`json
{
  "matchedClientId": string | null,
  "clientNotInDB": {
    "name": string | null,
    "email": string | null,
    "phone": string | null,
    "address": string | null,
    "taxId": string | null
  } | null,
  "documentType": "${documentType}",
  "items": [{"description":string,"rate":number,"qty":number,"category":"Service"|"Product"|"Consulting"|"Labour"|"Material"|"Other","taxRate":number}] | null,
  "notes": string | null,
  "paymentTerms": string | null,
  "dueInDays": number | null,
  "repeatLastInvoice": boolean
}
\`\`\`

RULES:
- Matched saved client → matchedClientId = their id, clientNotInDB = null
- New client not in list → matchedClientId = null, fill clientNotInDB with what user said
- "repeat last invoice" → repeatLastInvoice: true
- "5hrs at R350/hr" → {description:"...",rate:350,qty:5,category:"Service",taxRate:15}
- "no VAT" → taxRate:0
- taxRate defaults to 15
- General chat → all nulls, repeatLastInvoice: false
NEVER add markdown outside the json block.`;
};

const parseResponse = (text) => {
  try {
    const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (!m) return { reply: text.trim(), data: null };
    const data = JSON.parse(m[1].trim());
    const reply = text.slice(0, text.indexOf("```")).trim();
    return { reply: reply || "Got it — I've updated your document.", data };
  } catch {
    return { reply: text.trim(), data: null };
  }
};

const safeNum = (val) => Number(val) || 0;

/* ─────────────────────────────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────────────────────────────────*/
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
        className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"} w-full`}
        style={{ maxWidth: "85%" }}
      >
        <span
          className={`text-[10px] font-bold tracking-widest uppercase ${isUser ? "text-[#1655e0]" : "text-[#64748b]"}`}
        >
          {isUser ? "You" : "SolidFlo AI"}
        </span>

        <div
          className={`px-4 py-3 text-[13.5px] leading-relaxed ${
            isUser
              ? "bg-[#1655e0] text-white rounded-[18px_4px_18px_18px] shadow-lg shadow-[#1655e0]/20"
              : "bg-white text-[#1e293b] rounded-[4px_18px_18px_18px] border border-[#e5e7eb] shadow-sm"
          }`}
        >
          {msg.content}
        </div>

        {/* Status badges */}
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

        {/* Saved confirmation */}
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
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
        <img src="/logo.png" alt="SolidFlo" className="w-5 h-5" />
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

/* ─────────────────────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────────────────────────*/
function DocSidebar({ activeType, onChange, collapsed, onToggle, businessInfo, user, onLogout }) {
  return (
    <div
      style={{
        width: collapsed ? 64 : 220,
        flexShrink: 0,
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,.07)",
        transition: "width .25s ease",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? 0 : "0 14px",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 7,
                background: "linear-gradient(135deg,#1655e0,#7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
             <img src="{logo}" alt="SolidFlo" className="w-5 h-5" />
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                whiteSpace: "nowrap",
              }}
            >
              SolidFlo AI
            </span>
          </div>
        )}
        <button
          onClick={onToggle}
          style={{
            background: "rgba(255,255,255,.07)",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 7,
            color: "rgba(255,255,255,.6)",
            cursor: "pointer",
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {!collapsed && businessInfo?.businessName && (
        <div
          style={{
            padding: "10px 14px 6px",
            borderBottom: "1px solid rgba(255,255,255,.05)",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "rgba(255,255,255,.3)",
              letterSpacing: ".08em",
              textTransform: "uppercase",
              marginBottom: 3,
            }}
          >
            Account
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,.7)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {businessInfo.businessName}
          </div>
        </div>
      )}

      {!collapsed && (
        <div style={{ padding: "12px 14px 6px" }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "rgba(255,255,255,.3)",
              letterSpacing: ".08em",
              textTransform: "uppercase",
            }}
          >
            Document Type
          </div>
        </div>
      )}

      <div
        style={{
          flex: 1,
          padding: collapsed ? "12px 8px" : "0 8px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {DOC_TYPES.map((item) => {
          const Icon = item.icon;
          const active = activeType === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                position: "relative",
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: collapsed ? "10px 0" : "10px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 10,
                border: active
                  ? `1px solid ${item.color}40`
                  : "1px solid transparent",
                background: active ? `${item.color}20` : "transparent",
                cursor: "pointer",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                if (!active)
                  e.currentTarget.style.background = "rgba(255,255,255,.05)";
              }}
              onMouseLeave={(e) => {
                if (!active)
                  e.currentTarget.style.background = active
                    ? `${item.color}20`
                    : "transparent";
              }}
            >
              {collapsed && active && (
                <div
                  style={{
                    position: "absolute",
                    left: 4,
                    width: 3,
                    height: 20,
                    borderRadius: 2,
                    background: item.color,
                  }}
                />
              )}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: active ? item.color : "rgba(255,255,255,.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background .15s",
                }}
              >
                <Icon
                  size={16}
                  color={active ? "#fff" : "rgba(255,255,255,.5)"}
                />
              </div>
              {!collapsed && (
                <div style={{ textAlign: "left", minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: active ? "#fff" : "rgba(255,255,255,.65)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: active
                        ? "rgba(255,255,255,.5)"
                        : "rgba(255,255,255,.3)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.sublabel}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {!collapsed && (
  <div style={{
    padding: '10px 14px 14px',
    borderTop: '1px solid rgba(255,255,255,.08)',
  }}>
    {/* User info */}
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {/* Avatar circle */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#1655e0,#7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#fff',
        }}>
          {(user?.name || user?.email || '?')[0].toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          {user?.name && (
            <div style={{
              fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.8)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              maxWidth: 120,
            }}>
              {user.name}
            </div>
          )}
          <div style={{
            fontSize: 10, color: 'rgba(255,255,255,.35)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            maxWidth: 120,
          }}>
            {user?.email || 'Signed in'}
          </div>
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={onLogout}
        title="Sign out"
        style={{
          background: 'rgba(255,255,255,.06)',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 7, cursor: 'pointer',
          width: 28, height: 28, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,.4)',
          transition: 'all .15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(232,68,42,.2)';
          e.currentTarget.style.borderColor = 'rgba(232,68,42,.4)';
          e.currentTarget.style.color = '#f87171';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,.06)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)';
          e.currentTarget.style.color = 'rgba(255,255,255,.4)';
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </div>
  </div>
)}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────*/
export default function AIInvoiceWindow({
  user,
  onExit,
  documentType: initDocType = "invoice",
  TemplateRenderer,
}) {
  const [userData, setUserData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [documentType, setDocumentType] = useState(initDocType);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [pendingNewClient, setPendingNewClient] = useState(null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [taxId, setTaxId] = useState("");
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

  const bottomRef = useRef(null);
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const historyRef = useRef([]);
  const msgCounter = useRef(0);

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

  /* ── Load data ── */
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

  /* ── Chat history ── */
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
                "Hi! I'm SolidFlo AI. Choose a document type then describe what you need. When you mention a saved client I'll load their details from your database instantly. If you type a new client name I'll offer to save them to your contacts.",
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
      const rate = safeNum(item.rate);
      const qty = safeNum(item.qty) || 1;
      const taxR = safeNum(item.taxRate);
      const amt = rate * qty;
      const tax = amt * (taxR / 100);
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

  /* ══════════════════════════════════════════════════════
     SEND
  ══════════════════════════════════════════════════════ */
  const send = async (override) => {
    const trimmed = (override || input).trim();
    if (!trimmed || loading) return;
    setInput("");
    setError("");

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
      /* Step 1 — Client-side DB match */
const mentionedClient = findClientInText(trimmed, userData?.clients);
let appliedClient = null;

if (mentionedClient) {
  // ✅ Found in DB — fill template immediately
  applyClientFromDB(mentionedClient);
  appliedClient = mentionedClient.name;
} else {
 
  const isDocRequest = /invoice|bill|quote|estimate|purchase order|PO\b/i.test(trimmed);
  // Also check if it contains a capitalised word (likely a name/company)
  const hasName = /[A-Z][a-z]+/.test(trimmed);

  if (isDocRequest || hasName) {
    // Open CustomerModal immediately — don't wait for AI
    setPendingNewClient(null);
    setShowCustomerModal(true);
    setLoading(false);
    return; // stop here — don't call the AI yet
  }
}

      /* Step 2 — Repeat last invoice */
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

      /* Step 3 — Call Claude via proxy */
      const rawText = await callClaude({
        system: buildPrompt(userData, documentType),
        messages: historyRef.current,
      });

      const { reply, data: extracted } = parseResponse(rawText);
      let appliedItems = 0;

      if (extracted) {
  if (extracted.matchedClientId && !mentionedClient) {
    const dbClient = userData?.clients?.find(
      (c) => c.id === extracted.matchedClientId,
    );
    if (dbClient) {
      applyClientFromDB(dbClient);
      appliedClient = dbClient.name;
    }
  }
  if (extracted.items?.length && !isRepeat) {
    appliedItems = applyItems(extracted.items);
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

      const msgId = `a-${++msgCounter.current}`;
      const aiMsg = {
        id: msgId,
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
    s.textContent = `@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}body *{visibility:hidden!important;}#ai-print-area,#ai-print-area *{visibility:visible!important;}#ai-print-area{position:absolute!important;left:0!important;top:0!important;width:210mm!important;}}`;
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

      {/* BODY */}
      <div
        style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}
      >
        <DocSidebar
          activeType={documentType}
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
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((o) => !o)}
          businessInfo={bizInfo}
          user={user}
  onLogout={() => signOut(getAuth())}
        />

        {/* CHAT */}
        <div
          style={{
            width: previewOpen ? "42%" : "calc(100% - 64px)",
            minWidth: 320,
            display: "flex",
            flexDirection: "column",
            background: "#f8fafc",
            borderRight: previewOpen ? "1px solid #e5e7eb" : "none",
            transition: "width .3s ease",
            flexShrink: 0,
          }}
        > 
        {/* Chat top bar — always visible */}
<div style={{
  height: 48,
  background: '#0f172a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 14px',
  flexShrink: 0,
  borderBottom: '1px solid rgba(255,255,255,.07)',
}}>
  {/* Left — Back */}
  <button onClick={onExit} style={{
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '5px 12px', borderRadius: 8,
    background: 'rgba(255,255,255,.07)',
    border: '1px solid rgba(255,255,255,.12)',
    color: 'rgba(255,255,255,.7)',
    cursor: 'pointer', fontSize: 12, fontWeight: 600,
  }}>
    <ArrowLeft size={13} /> Back
  </button>

  {/* Right — show template button (only when preview is hidden) */}
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    {hasContent && !previewOpen && (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 11, color: '#4ade80', fontWeight: 600,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
        Live
      </div>
    )}
    <button
      onClick={() => setPreviewOpen(o => !o)}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '5px 12px', borderRadius: 8,
        background: previewOpen ? 'rgba(22,85,224,.3)' : '#1655e0',
        border: `1px solid ${previewOpen ? 'rgba(22,85,224,.5)' : '#1655e0'}`,
        color: '#fff',
        cursor: 'pointer', fontSize: 12, fontWeight: 600,
      }}>
      {previewOpen
        ? <><PanelRightClose size={13} /> Hide</>
        : <><PanelRight size={13} /> Show Template</>}
    </button>
    <button
      onClick={() => { if (window.confirm('Clear conversation?')) { setMessages([]); historyRef.current = []; }}}
      style={{
        background: 'none', border: '1px solid rgba(255,255,255,.1)',
        borderRadius: 7, color: 'rgba(255,255,255,.4)',
        cursor: 'pointer', padding: '5px 8px',
        display: 'flex', alignItems: 'center',
      }}>
      <RotateCcw size={12} />
    </button>
  </div>
</div>
          <div
            ref={chatRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 18px 8px",
              scrollbarWidth: "thin",
              scrollbarColor: "#e2e8f0 transparent",
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
                      {userData.clients.slice(0, 5).map((c) => (
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
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                            cursor: "pointer",
                            fontSize: 12,
                            color: "#374151",
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
                      fontSize: 13,
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
              <div key={msg.id || i} className="ai-msg"></div>
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
                <AlertCircle
                  size={14}
                  style={{ flexShrink: 0, marginTop: 1 }}
                />{" "}
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div
            style={{
              padding: "10px 14px 14px",
              background: "#fff",
              borderTop: "1px solid #e5e7eb",
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
                <span
                  style={{ fontSize: 10, color: "#15803d", fontWeight: 700 }}
                >
                  Firebase loaded
                </span>
                {[
                  userData.clients.length &&
                    `${userData.clients.length} clients`,
                  userData.recentInvoices.length &&
                    `${userData.recentInvoices.length} invoices`,
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
                        background: "#dcfce7",
                        border: "1px solid #bbf7d0",
                        fontSize: 10,
                        color: "#166534",
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
                background: "#f8fafc",
                border: "1.5px solid #d1d5db",
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
                    ? `e.g. "Invoice ${userData.clients[0]?.name} for 5hrs consulting at R750/hr"`
                    : "Describe your invoice in plain English…"
                }
                rows={2}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  fontSize: 13.5,
                  color: "#0f172a",
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
          </div>
        </div>

        {/* TEMPLATE PREVIEW */}
        {previewOpen && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: "#e2e8f0",
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            <div
              style={{
                height: 44,
                background: "#f8fafc",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <activeDt.icon size={15} color={activeDt.color} />
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}
                >
                  {activeDt.label} Preview
                </span>
                {hasContent && (
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 10,
                      background: "#dcfce7",
                      border: "1px solid #bbf7d0",
                      fontSize: 10,
                      color: "#15803d",
                      fontWeight: 700,
                    }}
                  >
                    ● Live
                  </span>
                )}
              </div>
              {/* TOP BAR */}

  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <button onClick={onExit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: 'rgba(0, 0, 0, 0.7)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
      <ArrowLeft size={13} /> Back
    </button>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 12px', borderRadius: 20, background: `${activeDt.color}20`, border: `1px solid ${activeDt.color}40` }}>
      <activeDt.icon size={12} color={activeDt.color} />
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: activeDt.color }}>{activeDt.label}</span>
    </div>
    {userData?.activeTemplate && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: 'rgba(0, 0, 0, 0.7)', border: '1px solid rgba(255,255,255,.1)' }}>
        <span style={{ fontSize: 10, color: 'rgba(255, 255, 255)' }}>Template:</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(160, 245, 255, 0.98)', textTransform: 'capitalize' }}>{userData.activeTemplate}</span>
      </div>
    )}
    {hasContent && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#35f904', fontWeight: 600 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} /> Live
      </div>
    )}
  </div>
  

              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={handlePrint}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 12px",
                    borderRadius: 8,
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    color: "#374151",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <Printer size={13} /> Print
                </button>
                <button
                  onClick={handlePrint}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 12px",
                    borderRadius: 8,
                    background: "#059669",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <Download size={13} /> PDF
                </button>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px 20px",
                display: "flex",
                justifyContent: "center",
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
                    maxWidth: 360,
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
                    <div
                      style={{
                        fontSize: 13,
                        color: "#94a3b8",
                        lineHeight: 1.6,
                      }}
                    >
                      {userData?.clients?.length
                        ? `Type a client name — I'll load their details from your ${userData.clients.length} saved contacts instantly`
                        : "Describe who you're billing and what for"}
                    </div>
                  </div>
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
                  background: "#f8fafc",
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
                  safeItems.length && {
                    label: "Items",
                    val: `${safeItems.length}`,
                  },
                  total > 0 && { label: "Total", val: `R${total.toFixed(2)}` },
                  customerEmail && { label: "Email", val: customerEmail },
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
                        style={{
                          fontSize: 10,
                          color: "#6b7280",
                          fontWeight: 700,
                        }}
                      >
                        {item.label}:{" "}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          color: "#1e293b",
                          fontWeight: 600,
                        }}
                      >
                        {item.val}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
