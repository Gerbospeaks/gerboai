import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/images/logo.png";
import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import styles from "./SolidFloAgent.module.css";

const WORKER_URL = "https://r2-upload-worker.v8-auto.workers.dev/ai-agent";

const QUICK_ACTIONS = [
  { label: "📄 New invoice", prompt: "I want to create a new invoice" },
  { label: "📋 New quote", prompt: "I want to create a quote" },
  { label: "👤 Add client", prompt: "I want to save a new client" },
  {
    label: "🔩 Add material",
    prompt: "I want to add a material or service to my price list",
  },
  { label: "💰 Unpaid invoices", prompt: "Show me my unpaid invoices" },
];

// ── Document parser ───────────────────────────────────────────────────────────
function parseAgentResponse(text) {
  const blocks = [];
  let remaining = text;

  // Parse [DOCUMENT] blocks
  const docRegex =
    /\[DOCUMENT type="(invoice|quote)"\]([\s\S]*?)\[\/DOCUMENT\]/g;
  remaining = remaining.replace(docRegex, (_, type, content) => {
    blocks.push({ kind: "document", type, raw: content.trim() });
    return `%%DOC_${blocks.length - 1}%%`;
  });

  // Parse [CLIENT] blocks
  const clientRegex = /\[CLIENT\]([\s\S]*?)\[\/CLIENT\]/g;
  remaining = remaining.replace(clientRegex, (_, content) => {
    blocks.push({ kind: "client", raw: content.trim() });
    return `%%DOC_${blocks.length - 1}%%`;
  });

  // Parse [MATERIAL] blocks
  const matRegex = /\[MATERIAL\]([\s\S]*?)\[\/MATERIAL\]/g;
  remaining = remaining.replace(matRegex, (_, content) => {
    blocks.push({ kind: "material", raw: content.trim() });
    return `%%DOC_${blocks.length - 1}%%`;
  });

  // Parse [ACTIONS] blocks
  const actRegex = /\[ACTIONS\]([\s\S]*?)\[\/ACTIONS\]/g;
  remaining = remaining.replace(actRegex, (_, content) => {
    const actions = content
      .trim()
      .split("\n")
      .map((line) => {
        const [label, variant] = line.split("|").map((s) => s.trim());
        return { label, variant: variant || "secondary" };
      })
      .filter((a) => a.label);
    blocks.push({ kind: "actions", actions });
    return `%%DOC_${blocks.length - 1}%%`;
  });

  // Split remaining text around placeholders
  const parts = remaining.split(/%%DOC_(\d+)%%/);
  const segments = [];
  parts.forEach((part, i) => {
    if (i % 2 === 0) {
      if (part.trim()) segments.push({ kind: "text", content: part.trim() });
    } else {
      segments.push(blocks[parseInt(part, 10)]);
    }
  });

  return segments;
}

// Parse a raw key: value block into an object
function parseKV(raw) {
  const obj = {};
  const lines = raw.split("\n");
  let currentKey = null;
  let items = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith("- ") && currentKey === "items") {
      // Parse item line: description: X | qty: Y | unitPrice: Z | total: W
      const itemParts = {};
      trimmed
        .slice(2)
        .split("|")
        .forEach((part) => {
          const [k, ...v] = part.split(":");
          if (k) itemParts[k.trim()] = v.join(":").trim();
        });
      items.push(itemParts);
    } else {
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx > -1) {
        currentKey = trimmed.slice(0, colonIdx).trim();
        const val = trimmed.slice(colonIdx + 1).trim();
        if (currentKey === "items") {
          obj.items = items;
        } else {
          obj[currentKey] = val;
        }
      }
    }
  });

  if (items.length) obj.items = items;
  return obj;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function DocumentCard({ data, type, onAction }) {
  const parsed = parseKV(data);

  return (
    <div className={styles.docCard}>
      <div className={styles.docHeader}>
        <span className={styles.docType}>
          {type === "invoice" ? "Invoice" : "Quote"}
        </span>
        <span className={styles.docClient}>{parsed.client || "—"}</span>
      </div>
      <div className={styles.docMeta}>
        <span>Date: {parsed.date}</span>
        <span>Due: {parsed.dueDate}</span>
      </div>
      {parsed.items && (
        <table className={styles.itemTable}>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {parsed.items.map((item, i) => (
              <tr key={i}>
                <td>{item.description}</td>
                <td>{item.qty}</td>
                <td>R{item.unitPrice}</td>
                <td>R{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className={styles.docTotals}>
        <div className={styles.totalRow}>
          <span>Subtotal</span>
          <span>R{parsed.subtotal}</span>
        </div>
        {parsed.discount && parsed.discount !== "0" && (
          <div className={styles.totalRow}>
            <span>Discount</span>
            <span>-R{parsed.discount}</span>
          </div>
        )}
        <div className={styles.totalRow}>
          <span>VAT (15%)</span>
          <span>R{parsed.vat}</span>
        </div>
        <div className={`${styles.totalRow} ${styles.grandTotal}`}>
          <span>Total</span>
          <span>R{parsed.total}</span>
        </div>
      </div>
      {parsed.notes && (
        <div className={styles.docNotes}>
          <span>Notes:</span> {parsed.notes}
        </div>
      )}
    </div>
  );
}

function ClientCard({ data }) {
  const parsed = parseKV(data);
  return (
    <div className={styles.clientCard}>
      <div className={styles.clientAvatar}>
        {(parsed.name || "?")
          .split(" ")
          .slice(0, 2)
          .map((w) => w[0])
          .join("")
          .toUpperCase()}
      </div>
      <div className={styles.clientInfo}>
        <p className={styles.clientName}>{parsed.name}</p>
        {parsed.company && <p className={styles.clientSub}>{parsed.company}</p>}
        {parsed.email && (
          <p className={styles.clientDetail}>✉ {parsed.email}</p>
        )}
        {parsed.phone && (
          <p className={styles.clientDetail}>📞 {parsed.phone}</p>
        )}
        {parsed.address && (
          <p className={styles.clientDetail}>📍 {parsed.address}</p>
        )}
      </div>
    </div>
  );
}

function MaterialCard({ data }) {
  const parsed = parseKV(data);
  return (
    <div className={styles.materialCard}>
      <div className={styles.materialIcon}>
        {parsed.category === "labour"
          ? "🔧"
          : parsed.category === "service"
            ? "⚙️"
            : "📦"}
      </div>
      <div className={styles.materialInfo}>
        <p className={styles.materialName}>{parsed.name}</p>
        <p className={styles.materialPrice}>
          R{parsed.price} / {parsed.unit || "unit"}
        </p>
        {parsed.category && (
          <span className={styles.materialBadge}>{parsed.category}</span>
        )}
      </div>
    </div>
  );
}

function ActionButtons({ actions, onAction }) {
  return (
    <div className={styles.actionRow}>
      {actions.map((action, i) => (
        <button
          key={i}
          className={`${styles.actionBtn} ${action.variant === "primary" ? styles.actionPrimary : styles.actionSecondary}`}
          onClick={() => onAction(action.label)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

function MessageSegments({ segments, onAction }) {
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.kind === "text") {
          return (
            <p key={i} className={styles.msgText}>
              {seg.content}
            </p>
          );
        }
        if (seg.kind === "document") {
          return (
            <DocumentCard
              key={i}
              data={seg.raw}
              type={seg.type}
              onAction={onAction}
            />
          );
        }
        if (seg.kind === "client") {
          return <ClientCard key={i} data={seg.raw} />;
        }
        if (seg.kind === "material") {
          return <MaterialCard key={i} data={seg.raw} />;
        }
        if (seg.kind === "actions") {
          return (
            <ActionButtons key={i} actions={seg.actions} onAction={onAction} />
          );
        }
        return null;
      })}
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SolidFloAgent({
  industry = "general",
  position = "right",
}) {
  const { user, authUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState({
    clients: [],
    materials: [],
    recentInvoices: [],
  });
  const [contextLoaded, setContextLoaded] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (!contextLoaded) loadContext();
      if (messages.length === 0) sendWelcome();
    }
  }, [open]);

  // ── Load Firestore context (clients, materials, recent invoices) ────────────
  const loadContext = useCallback(async () => {
    if (!user?.uid) return;
    const uid = user.uid;

    try {
      const [clientSnap, materialSnap, invoiceSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, "users", uid, "clients"),
            orderBy("name"),
            limit(50),
          ),
        ),
        getDocs(
          query(
            collection(db, "users", uid, "materials"),
            orderBy("name"),
            limit(100),
          ),
        ),
        getDocs(
          query(
            collection(db, "users", uid, "invoices"),
            orderBy("createdAt", "desc"),
            limit(10),
          ),
        ),
      ]);

      setContext({
        clients: clientSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        materials: materialSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        recentInvoices: invoiceSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })),
      });
      setContextLoaded(true);
    } catch (err) {
      console.error("[SolidFloAgent] Failed to load context:", err);
      setContextLoaded(true);
    }
  }, [user]);

  // ── Welcome message ────────────────────────────────────────────────────────
  const sendWelcome = () => {
    setMessages([
      {
        role: "assistant",
        id: "welcome",
        segments: [
          {
            kind: "text",
            content: `Hi! I'm your SolidFlo assistant for your ${industry} business. I can create invoices, quotes, save clients, and manage your materials. What would you like to do?`,
          },
        ],
      },
    ]);
  };

  // ── Save document to Firestore ─────────────────────────────────────────────
  const saveDocument = useCallback(
    async (segments, actionLabel) => {
      if (!user?.uid) return;
      const uid = user.uid;

      const docSegment = segments.find((s) => s.kind === "document");
      const clientSegment = segments.find((s) => s.kind === "client");
      const materialSegment = segments.find((s) => s.kind === "material");

      try {
        if (
          docSegment &&
          (actionLabel === "Save & Send" || actionLabel === "Save as Draft")
        ) {
          const parsed = parseKV(docSegment.raw);
          const isDraft = actionLabel === "Save as Draft";
          const ref = await addDoc(collection(db, "users", uid, "invoices"), {
            type: docSegment.type,
            clientName: parsed.client || "",
            clientEmail: parsed.clientEmail || "",
            clientPhone: parsed.clientPhone || "",
            date: parsed.date || "",
            dueDate: parsed.dueDate || "",
            items: parsed.items || [],
            subtotal: parseFloat(parsed.subtotal) || 0,
            vat: parseFloat(parsed.vat) || 0,
            discount: parseFloat(parsed.discount) || 0,
            total: parseFloat(parsed.total) || 0,
            notes: parsed.notes || "",
            status: isDraft ? "draft" : "sent",
            industry,
            createdAt: serverTimestamp(),
          });
          return `✅ ${docSegment.type === "invoice" ? "Invoice" : "Quote"} ${isDraft ? "saved as draft" : "saved and marked as sent"}! ID: ${ref.id.slice(0, 8).toUpperCase()}`;
        }

        if (clientSegment && actionLabel === "Save Client") {
          const parsed = parseKV(clientSegment.raw);
          await addDoc(collection(db, "users", uid, "clients"), {
            name: parsed.name || "",
            email: parsed.email || "",
            phone: parsed.phone || "",
            address: parsed.address || "",
            company: parsed.company || "",
            industry,
            createdAt: serverTimestamp(),
          });
          // Refresh context
          await loadContext();
          return `✅ Client "${parsed.name}" saved successfully!`;
        }

        if (materialSegment && actionLabel === "Add to Price List") {
          const parsed = parseKV(materialSegment.raw);
          await addDoc(collection(db, "users", uid, "materials"), {
            name: parsed.name || "",
            price: parseFloat(parsed.price) || 0,
            unit: parsed.unit || "unit",
            category: parsed.category || "material",
            industry,
            createdAt: serverTimestamp(),
          });
          // Refresh context
          await loadContext();
          return `✅ "${parsed.name}" added to your price list!`;
        }
      } catch (err) {
        console.error("[SolidFloAgent] Save error:", err);
        return "❌ Something went wrong saving. Please try again.";
      }

      return null;
    },
    [user, industry, loadContext],
  );

  // ── Handle action button clicks ────────────────────────────────────────────
  const handleAction = useCallback(
    async (actionLabel, messageSegments) => {
      const saveResult = await saveDocument(messageSegments, actionLabel);
      if (saveResult) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            id: Date.now().toString(),
            segments: [{ kind: "text", content: saveResult }],
          },
        ]);
        return;
      }
      // If no save result, treat as a chat prompt
      sendMessage(actionLabel);
    },
    [saveDocument],
  );

  // ── Send a message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (overrideText) => {
    const text = overrideText || input.trim();
    if (!text || loading) return;
    if (!authUser) {
      console.error("[SolidFloAgent] No authenticated user");
      return;
    }
    if (!overrideText) setInput("");

     
      if (!text || loading) return;
      if (!overrideText) setInput("");

      const userMsg = {
        role: "user",
        id: Date.now().toString(),
        content: text,
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      // Build history for the API (exclude welcome, include only role+content)
      const history = messages
        .filter((m) => m.content || m.segments)
        .map((m) => ({
          role: m.role,
          content:
            m.role === "user"
              ? m.content
              : m.segments?.map((s) => s.content || s.raw || "").join("\n") ||
                "",
        }))
        .filter((m) => m.content);

      history.push({ role: "user", content: text });

      try {
        const idToken = await authUser.getIdToken();
        const res = await fetch(WORKER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await user.getIdToken()}`,
            "X-SF-Industry": industry,
            "X-SF-UID": user?.uid || "",
          },
          body: JSON.stringify({
            messages: history,
            industry,
            context: {
              clients: context.clients,
              materials: context.materials,
              recentInvoices: context.recentInvoices,
            },
          }),
        });

        if (!res.ok) {
          throw new Error(`Worker responded with ${res.status}`);
        }

        const data = await res.json();
        const replyText =
          data.content?.find((b) => b.type === "text")?.text || "";
        const segments = parseAgentResponse(replyText);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            id: Date.now().toString(),
            rawText: replyText,
            segments,
          },
        ]);
      } catch (err) {
        console.error("[SolidFloAgent] Error:", err);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            id: Date.now().toString(),
            segments: [
              {
                kind: "text",
                content:
                  "Connection error. Please check your internet and try again.",
              },
            ],
          },
        ]);
      } finally {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [input, loading, messages, context, industry, user, authUser],
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating toggle button */}
      <button
        className={`${styles.fab} ${position === "left" ? styles.fabLeft : styles.fabRight} ${open ? styles.fabOpen : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
      >
        {open ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            <path d="M20 2H4C2.9 2 2 2.9 2 4v16l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 11H6v-2h12v2zm0-3H6V8h12v2z" />
          </svg>
        )}
        {!open && <span className={styles.fabLabel}>AI Assistant</span>}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className={`${styles.panel} ${position === "left" ? styles.panelLeft : styles.panelRight}`}
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerAvatar}>
              <img src={logo} width={80} alt="" />{" "}
            </div>
            <div className={styles.headerText}>
              <p className={styles.headerTitle}>SolidFlo Assistant</p>
              <p className={styles.headerSub}>
                {industry.charAt(0).toUpperCase() + industry.slice(1)} · AI
                powered
              </p>
            </div>
            <div className={styles.statusDot} aria-label="Online" />
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            {messages.map((msg) =>
              msg.role === "user" ? (
                <div key={msg.id} className={`${styles.msg} ${styles.msgUser}`}>
                  <div className={styles.bubble}>{msg.content}</div>
                  <span className={styles.msgTime}>
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ) : (
                <div
                  key={msg.id}
                  className={`${styles.msg} ${styles.msgAgent}`}
                >
                  <div className={styles.agentBubble}>
                    <MessageSegments
                      segments={msg.segments || []}
                      onAction={(label) =>
                        handleAction(label, msg.segments || [])
                      }
                    />
                  </div>
                  <span className={styles.msgTime}>
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ),
            )}

            {loading && (
              <div className={`${styles.msg} ${styles.msgAgent}`}>
                <div className={styles.agentBubble}>
                  <div className={styles.typing}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick action chips — shown only on first open */}
          {messages.length <= 1 && (
            <div className={styles.chips}>
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  className={styles.chip}
                  onClick={() => sendMessage(a.prompt)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className={styles.inputRow}>
            <textarea
              ref={inputRef}
              className={styles.input}
              rows={1}
              placeholder="Ask about invoices, clients, quotes…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className={styles.sendBtn}
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
