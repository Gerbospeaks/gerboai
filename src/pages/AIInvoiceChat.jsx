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
  setDoc,
} from "firebase/firestore";
import {
  Sparkles,
  Send,
  RotateCcw,
  User,
  Copy,
  Check,
  ChevronDown,
  FileText,
  AlertCircle,
  Loader2,
  Lightbulb,
  ArrowRight,
  Save,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   SYSTEM PROMPT — tells Claude exactly what structured JSON to return
───────────────────────────────────────────────────────────────────────────── */
const SYSTEM_PROMPT = `You are an expert invoice assistant embedded inside SolidFlo, a professional billing platform.

Your ONLY job is to extract invoice data from the user's natural language message and return a JSON object.

ALWAYS respond with:
1. A brief, friendly conversational reply (1-2 sentences max)
2. Then a JSON block wrapped in triple backticks like this:

\`\`\`json
{ ... }
\`\`\`

The JSON must follow this exact shape (include only fields the user mentioned, leave others as null):
{
  "customerName": string | null,
  "customerEmail": string | null,
  "customerPhone": string | null,
  "customerAddress": string | null,
  "taxId": string | null,
  "billName": string | null,
  "billEmail": string | null,
  "billPhone": string | null,
  "billAddress": string | null,
  "documentType": "invoice" | "estimate" | null,
  "items": [
    {
      "description": string,
      "rate": number,
      "qty": number,
      "category": "Service" | "Product" | "Consulting" | "Labour" | "Material" | "Other",
      "taxRate": number
    }
  ] | null,
  "notes": string | null,
  "paymentTerms": string | null,
  "currency": string | null,
  "dueInDays": number | null
}

Rules:
- If user says "invoice for John" extract customerName: "John"
- If user says "5 hours of design at R350/hr" create an item: {description: "Design Work", rate: 350, qty: 5, category: "Service", taxRate: 15}
- If user says "no VAT" set taxRate: 0 on all items
- Always infer sensible taxRate (15 for ZA, 20 for UK/EU, 0 if user says no tax)
- If user says "quote" or "estimate" set documentType: "estimate"
- Convert all amounts to numbers (strip currency symbols)
- Be smart: "build a website for R5000" → one item: {description: "Website Development", rate: 5000, qty: 1, category: "Service", taxRate: 15}
- If user just says "hello" or asks a general question, return all null fields but still reply helpfully
- NEVER include markdown outside the json block except your 1-2 sentence reply`;

/* ─────────────────────────────────────────────────────────────────────────────
   PARSE AI RESPONSE — extract the JSON block
───────────────────────────────────────────────────────────────────────────── */
const parseAIResponse = (text) => {
  try {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (!match) return { reply: text.trim(), data: null };
    const data = JSON.parse(match[1].trim());
    const reply = text.slice(0, text.indexOf("```")).trim();
    return { reply: reply || "Got it! I've updated your invoice.", data };
  } catch {
    return { reply: text.trim(), data: null };
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PROMPTS CAROUSEL
───────────────────────────────────────────────────────────────────────────── */
const SUGGESTIONS = [
  "Invoice ABC Corp for 3 hours of consulting at R800/hr, add VAT",
  "Quote for website design: R12,000 flat rate, net 30 days",
  "Bill John Smith (john@co.com) for 2 solar panels at R4,500 each",
  "Create an estimate for painting 200m² at R45/m²",
  "Invoice for plumbing repair — labour R1,200 + materials R350",
  "Monthly retainer invoice for Cape Town Logistics — R6,500/month",
];

/* ─────────────────────────────────────────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────────────────────────────────────────── */
function MessageBubble({ msg, onApply }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        gap: 10,
        marginBottom: 20,
        alignItems: "flex-start",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          flexShrink: 0,
          background: isUser ? "#1655e0" : "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 2,
        }}
      >
        {isUser ? (
          <User size={14} color="#fff" />
        ) : (
          <Sparkles size={14} color="#fff" />
        )}
      </div>

      <div
        style={{
          maxWidth: "82%",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {/* Sender label */}
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".04em",
            textTransform: "uppercase",
            color: isUser ? "#1655e0" : "#64748b",
            alignSelf: isUser ? "flex-end" : "flex-start",
          }}
        >
          {isUser ? "You" : "SolidFlo AI"}
        </span>

        {/* Bubble */}
        <div
          style={{
            padding: "11px 14px",
            borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
            background: isUser ? "#1655e0" : "#fff",
            border: isUser ? "none" : "1px solid #e5e7eb",
            color: isUser ? "#fff" : "#1e293b",
            fontSize: 13,
            lineHeight: 1.65,
            boxShadow: isUser
              ? "0 2px 8px rgba(22,85,224,.2)"
              : "0 1px 4px rgba(0,0,0,.06)",
          }}
        >
          {msg.content}
        </div>

        {/* Applied badge + actions */}
        {!isUser && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              alignSelf: "flex-start",
            }}
          >
            {msg.hasData && !msg.applied && (
              <button
                onClick={() => onApply(msg)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  color: "#15803d",
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "inherit",
                }}
              >
                <ArrowRight size={11} /> Apply to Invoice
              </button>
            )}
            {msg.applied && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: "#15803d",
                  fontWeight: 600,
                }}
              >
                <Check size={11} /> Applied to template
              </span>
            )}
            <button
              onClick={copy}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                padding: "2px 4px",
                borderRadius: 4,
              }}
            >
              {copied ? (
                <Check size={12} color="#22c55e" />
              ) : (
                <Copy size={12} />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TYPING INDICATOR
───────────────────────────────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          flexShrink: 0,
          background: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Sparkles size={14} color="#fff" />
      </div>
      <div style={{ marginTop: 2 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#64748b",
            letterSpacing: ".04em",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 6,
          }}
        >
          SolidFlo AI
        </span>
        <div
          style={{
            padding: "12px 16px",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "4px 16px 16px 16px",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#94a3b8",
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function AIInvoiceChat({
  user,
  onDataExtracted,
  documentType = "invoice",
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msgIds, setMsgIds] = useState({}); // track applied state by index
  const [showScroll, setShowScroll] = useState(false);

  const bottomRef = useRef(null);
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const historyRef = useRef([]); // keeps messages for API context

  /* ── Load chat history from Firestore ── */
  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      try {
        const q = query(
          collection(db, "users", user.uid, "aiChatHistory"),
          orderBy("createdAt", "asc"),
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const loaded = snap.docs.map((d) => d.data());
          setMessages(loaded);
          historyRef.current = loaded.map((m) => ({
            role: m.role,
            content: m.rawContent || m.content,
          }));
        } else {
          // Welcome message
          const welcome = {
            role: "assistant",
            content: `Hi! I'm your SolidFlo AI assistant. Just describe your invoice in plain English — who you're billing, what services or products, amounts, and any special terms — and I'll fill it in for you instantly. You can also edit specific fields like "change the tax rate to 0%" or "add another item for R500".`,
            hasData: false,
            applied: false,
          };
          setMessages([welcome]);
        }
      } catch (e) {
        console.error("Chat history load error", e);
      }
    })();
  }, [user?.uid]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleScroll = () => {
    if (!chatRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
    setShowScroll(scrollHeight - scrollTop - clientHeight > 80);
  };

  /* ── Save message to Firestore ── */
  const saveMessage = async (msg) => {
    if (!user?.uid) return;
    try {
      await addDoc(collection(db, "users", user.uid, "aiChatHistory"), {
        ...msg,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Save message error", e);
    }
  };

  /* ── Apply extracted data to parent ── */
  const applyData = useCallback(
    (msg, idx) => {
      if (!msg.extractedData) return;
      const d = msg.extractedData;

      // Build items in the format AccountingDashboard expects
      const formattedItems = (d.items || []).map((item) => {
        const rate = Number(item.rate) || 0;
        const qty = Number(item.qty) || 1;
        const taxR = Number(item.taxRate) || 15;
        const amount = rate * qty;
        const taxAmt = amount * (taxR / 100);
        return {
          description: item.description || "",
          category: item.category || "Service",
          rate,
          qty,
          amount,
          taxRate: taxR,
          taxAmount: taxAmt,
          totalAmount: amount + taxAmt,
        };
      });

      onDataExtracted({
        customer: {
          name: d.customerName || "",
          email: d.customerEmail || "",
          phone: d.customerPhone || "",
          address: d.customerAddress || "",
          tax_id: d.taxId || "",
        },
        billTo: {
          name: d.billName || d.customerName || "",
          email: d.billEmail || d.customerEmail || "",
          phone: d.billPhone || d.customerPhone || "",
          address: d.billAddress || d.customerAddress || "",
        },
        items: formattedItems,
        documentType: d.documentType || documentType,
        notes: d.notes || "",
        paymentTerms: d.paymentTerms || "",
        currency: d.currency || "ZAR",
        dueInDays: d.dueInDays || 30,
      });

      // Mark as applied
      setMessages((prev) =>
        prev.map((m, i) => (i === idx ? { ...m, applied: true } : m)),
      );
    },
    [onDataExtracted, documentType],
  );

  /* ── Send message ── */
  const send = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;
    setInput("");
    setError("");

    const userMsg = { role: "user", content: trimmed, rawContent: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    historyRef.current = [
      ...historyRef.current,
      { role: "user", content: trimmed },
    ];
    await saveMessage(userMsg);

    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: historyRef.current,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      const rawText = data.content?.[0]?.text || "";
      const { reply, data: extracted } = parseAIResponse(rawText);

      const aiMsg = {
        role: "assistant",
        content: reply || "Here's what I extracted from your message.",
        rawContent: rawText,
        hasData:
          !!extracted && !!(extracted.items?.length || extracted.customerName),
        applied: false,
        extractedData: extracted,
      };

      setMessages((prev) => [...prev, aiMsg]);
      historyRef.current = [
        ...historyRef.current,
        { role: "assistant", content: rawText },
      ];
      await saveMessage(aiMsg);

      // Auto-apply if data found
      if (aiMsg.hasData && extracted) {
        setTimeout(() => {
          setMessages((prev) => {
            const idx = prev.length - 1;
            applyData({ ...aiMsg, extractedData: extracted }, idx);
            return prev.map((m, i) =>
              i === idx ? { ...m, applied: true } : m,
            );
          });
        }, 400);
      }
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
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

  const clearChat = async () => {
    if (!window.confirm("Clear this conversation?")) return;
    setMessages([]);
    historyRef.current = [];
    // Note: doesn't delete Firestore history — add that if needed
  };

  /* ── Extracted fields summary ── */
  const lastExtracted = [...messages]
    .reverse()
    .find((m) => m.hasData)?.extractedData;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#f8fafc",
        fontFamily: "'DM Sans', 'Lato', sans-serif",
      }}
    >
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .aic-msg { animation: fadeSlideIn .25s ease; }
        .aic-input:focus { outline: none; border-color: #1655e0 !important; box-shadow: 0 0 0 3px rgba(22,85,224,.1) !important; }
        .aic-send:hover { background: #1245c0 !important; }
        .aic-send:disabled { opacity: .5; cursor: not-allowed; }
        .aic-suggest:hover { background: #eff6ff !important; border-color: #bfdbfe !important; color: #1d4ed8 !important; }
      `}</style>

      {/* ── Header ── */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #e5e7eb",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg, #0f172a 0%, #1655e0 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
              SolidFlo AI
            </div>
            <div
              style={{
                fontSize: 10,
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                gap: 4,
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
              Describe your invoice in plain English
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Live fields summary pill */}
          {lastExtracted && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 20,
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                fontSize: 11,
                color: "#15803d",
                fontWeight: 600,
              }}
            >
              <Check size={11} />
              {[
                lastExtracted.customerName && "1 client",
                lastExtracted.items?.length &&
                  `${lastExtracted.items.length} item${lastExtracted.items.length > 1 ? "s" : ""}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
          )}
          <button
            onClick={clearChat}
            style={{
              background: "none",
              border: "1px solid #e5e7eb",
              borderRadius: 7,
              color: "#94a3b8",
              cursor: "pointer",
              padding: "5px 8px",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <RotateCcw size={12} /> Clear
          </button>
        </div>
      </div>

      {/* ── Messages area ── */}
      <div
        ref={chatRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          scrollbarWidth: "thin",
          scrollbarColor: "#e5e7eb transparent",
        }}
      >
        {/* Empty state — suggestion chips */}
        {messages.length <= 1 && (
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 14,
                color: "#64748b",
                fontSize: 12,
              }}
            >
              <Lightbulb size={13} color="#f59e0b" />
              <span style={{ fontWeight: 600 }}>Try one of these:</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="aic-suggest"
                  onClick={() => send(s)}
                  style={{
                    textAlign: "left",
                    padding: "9px 13px",
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontSize: 12,
                    color: "#374151",
                    fontFamily: "inherit",
                    transition: "all .15s",
                    lineHeight: 1.4,
                  }}
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} className="aic-msg">
            <MessageBubble msg={msg} onApply={(m) => applyData(m, i)} />
          </div>
        ))}

        {loading && <TypingIndicator />}

        {/* Error */}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 10,
              marginBottom: 16,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontSize: 12,
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScroll && (
        <button
          onClick={() =>
            bottomRef.current?.scrollIntoView({ behavior: "smooth" })
          }
          style={{
            position: "absolute",
            bottom: 80,
            right: 20,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#fff",
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,.1)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <ChevronDown size={16} color="#64748b" />
        </button>
      )}

      {/* ── Live data preview strip ── */}
      {lastExtracted && (
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            background: "#fffbeb",
            padding: "8px 16px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#92400e",
              whiteSpace: "nowrap",
              letterSpacing: ".04em",
              textTransform: "uppercase",
            }}
          >
            Template data:
          </span>
          {[
            lastExtracted.customerName && {
              label: "Client",
              val: lastExtracted.customerName,
            },
            lastExtracted.items?.length && {
              label: "Items",
              val: `${lastExtracted.items.length} line item${lastExtracted.items.length > 1 ? "s" : ""}`,
            },
            lastExtracted.items?.[0] && {
              label: "First item",
              val: `${lastExtracted.items[0].description} (R${lastExtracted.items[0].rate} × ${lastExtracted.items[0].qty})`,
            },
            lastExtracted.dueInDays && {
              label: "Due",
              val: `Net ${lastExtracted.dueInDays}`,
            },
          ]
            .filter(Boolean)
            .map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 8px",
                  background: "#fff",
                  border: "1px solid #fde68a",
                  borderRadius: 6,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{ fontSize: 10, color: "#92400e", fontWeight: 700 }}
                >
                  {item.label}:
                </span>
                <span style={{ fontSize: 10, color: "#0f172a" }}>
                  {item.val}
                </span>
              </div>
            ))}
        </div>
      )}

      {/* ── Input area ── */}
      <div
        style={{
          padding: "12px 16px 16px",
          background: "#fff",
          borderTop: "1px solid #e5e7eb",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
            background: "#f8fafc",
            border: "1.5px solid #e5e7eb",
            borderRadius: 14,
            padding: "8px 8px 8px 14px",
            transition: "border-color .15s, box-shadow .15s",
          }}
          onFocus={() => {}}
        >
          <textarea
            ref={inputRef}
            className="aic-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Describe your invoice… e.g. Invoice Acme Corp for 5 hours web dev at R650/hr"
            rows={2}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              resize: "none",
              fontSize: 13,
              color: "#0f172a",
              fontFamily: "inherit",
              lineHeight: 1.55,
              maxHeight: 100,
              overflowY: "auto",
            }}
          />
          <button
            className="aic-send"
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
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
              <Send size={15} color="#fff" />
            )}
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 7,
            paddingLeft: 2,
          }}
        >
          <span style={{ fontSize: 10, color: "#94a3b8" }}>
            Press{" "}
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
            to send ·{" "}
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
            for new line
          </span>
          {user?.uid && (
            <span
              style={{
                fontSize: 10,
                color: "#cbd5e1",
                fontFamily: "monospace",
              }}
            >
              UID: {user.uid.slice(0, 8)}…
            </span>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
