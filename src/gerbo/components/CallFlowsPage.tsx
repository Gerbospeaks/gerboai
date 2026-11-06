import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlowNode {
  id: string;
  type: NodeType;
  title: string;
  desc: string;
}

type NodeType =
  | "greeting"
  | "menu"
  | "transfer"
  | "voicemail"
  | "condition"
  | "sms"
  | "hangup";

interface CallFlow {
  id: string;
  name: string;
  active: boolean;
  nodes: FlowNode[];
  createdAt: string;
  updatedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NODE_TYPES: {
  value: NodeType;
  label: string;
  icon: string;
  defaultDesc: string;
  color: string;
  bg: string;
}[] = [
  {
    value: "greeting",
    label: "Greeting",
    icon: "👋",
    defaultDesc: "Hello! Thank you for calling. How can I help you today?",
    color: "#0F6E56",
    bg: "#E1F5EE",
  },
  {
    value: "menu",
    label: "Menu",
    icon: "📋",
    defaultDesc:
      "Press 1 for Sales, Press 2 for Support, Press 3 to leave a message",
    color: "#185FA5",
    bg: "#E6F1FB",
  },
  {
    value: "transfer",
    label: "Transfer",
    icon: "🔀",
    defaultDesc: "Transfer to your forwarding number",
    color: "#854F0B",
    bg: "#FAEEDA",
  },
  {
    value: "voicemail",
    label: "Voicemail",
    icon: "📬",
    defaultDesc: "Please leave your name and number after the tone.",
    color: "#3C3489",
    bg: "#EEEDFE",
  },
  {
    value: "condition",
    label: "Condition",
    icon: "⚡",
    defaultDesc: "Route based on business hours — Mon–Fri 8am–5pm",
    color: "#712B13",
    bg: "#FAECE7",
  },
  {
    value: "sms",
    label: "Send SMS",
    icon: "💬",
    defaultDesc: "We received your call and will get back to you shortly.",
    color: "#72243E",
    bg: "#FBEAF0",
  },
  {
    value: "hangup",
    label: "Hang up",
    icon: "📵",
    defaultDesc: "Thank you for calling. Goodbye!",
    color: "#791F1F",
    bg: "#FCEBEB",
  },
];

const newNodeId = () =>
  `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
const newFlowId = () => `flow_${Date.now()}`;

const DEFAULT_FLOW = (): Omit<CallFlow, "createdAt" | "updatedAt"> => ({
  id: newFlowId(),
  name: "New Flow",
  active: false,
  nodes: [
    {
      id: newNodeId(),
      type: "greeting",
      title: "Welcome Greeting",
      desc: "Thank you for calling. How can I assist you today?",
    },
  ],
});

// ─── Sub-components ───────────────────────────────────────────────────────────

const NodeTypeMeta = (type: NodeType) =>
  NODE_TYPES.find((t) => t.value === type) ?? NODE_TYPES[0];

interface NodeCardProps {
  node: FlowNode;
  index: number;
  total: number;
  isEditing: boolean;
  onEdit: () => void;
  onDone: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onChange: (field: keyof FlowNode, value: string) => void;
}

const NodeCard: React.FC<NodeCardProps> = ({
  node,
  index,
  total,
  isEditing,
  onEdit,
  onDone,
  onDelete,
  onMoveUp,
  onMoveDown,
  onChange,
}) => {
  const meta = NodeTypeMeta(node.type);

  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
      {/* Left connector */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 40,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: meta.bg,
            border: `2px solid ${meta.color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            zIndex: 1,
            flexShrink: 0,
          }}
        >
          {meta.icon}
        </div>
        {index < total - 1 && (
          <div
            style={{
              flex: 1,
              width: 2,
              background: "var(--color-border-secondary)",
              minHeight: 20,
            }}
          />
        )}
      </div>

      {/* Node body */}
      <div style={{ flex: 1, marginBottom: 16, marginLeft: 4 }}>
        <div
          style={{
            background: isEditing
              ? "var(--color-background-primary)"
              : "var(--color-background-secondary)",
            border: isEditing
              ? `1px solid ${meta.color}`
              : "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            padding: "1rem 1.25rem",
            transition: "border-color .15s",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: "var(--border-radius-md)",
                background: meta.bg,
                color: meta.color,
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              {meta.label}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                flex: 1,
                color: "var(--color-text-primary)",
              }}
            >
              {node.title}
            </span>

            {/* Move buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {index > 0 && (
                <button
                  onClick={onMoveUp}
                  title="Move up"
                  style={{
                    fontSize: 10,
                    padding: "1px 5px",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: 3,
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.4,
                  }}
                >
                  ▲
                </button>
              )}
              {index < total - 1 && (
                <button
                  onClick={onMoveDown}
                  title="Move down"
                  style={{
                    fontSize: 10,
                    padding: "1px 5px",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: 3,
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.4,
                  }}
                >
                  ▼
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          {!isEditing && (
            <p
              style={{
                fontSize: 13,
                color: "var(--color-text-secondary)",
                lineHeight: 1.5,
                marginBottom: 8,
              }}
            >
              {node.desc}
            </p>
          )}

          {/* Edit form */}
          {isEditing && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                margin: "10px 0",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-secondary)",
                    marginBottom: 4,
                  }}
                >
                  Step label
                </div>
                <input
                  className="settings-input"
                  value={node.title}
                  onChange={(e) => onChange("title", e.target.value)}
                  placeholder="Step label"
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: 13,
                    border: "0.5px solid var(--color-border-secondary)",
                    borderRadius: "var(--border-radius-md)",
                    background: "var(--color-background-primary)",
                    color: "var(--color-text-primary)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-secondary)",
                    marginBottom: 4,
                  }}
                >
                  Message / description
                </div>
                <input
                  value={node.desc}
                  onChange={(e) => onChange("desc", e.target.value)}
                  placeholder="What the AI says or does at this step"
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: 13,
                    border: "0.5px solid var(--color-border-secondary)",
                    borderRadius: "var(--border-radius-md)",
                    background: "var(--color-background-primary)",
                    color: "var(--color-text-primary)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-secondary)",
                    marginBottom: 4,
                  }}
                >
                  Step type
                </div>
                <select
                  value={node.type}
                  onChange={(e) => onChange("type", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    fontSize: 13,
                    border: "0.5px solid var(--color-border-secondary)",
                    borderRadius: "var(--border-radius-md)",
                    background: "var(--color-background-primary)",
                    color: "var(--color-text-primary)",
                    outline: "none",
                  }}
                >
                  {NODE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <button
              onClick={isEditing ? onDone : onEdit}
              style={{
                fontSize: 12,
                padding: "3px 10px",
                border: "0.5px solid var(--color-border-secondary)",
                borderRadius: "var(--border-radius-md)",
                background: "transparent",
                cursor: "pointer",
                color: "var(--color-text-secondary)",
              }}
            >
              {isEditing ? "✓ Done" : "Edit"}
            </button>
            <button
              onClick={onDelete}
              style={{
                fontSize: 12,
                padding: "3px 10px",
                border: "0.5px solid #F09595",
                borderRadius: "var(--border-radius-md)",
                background: "transparent",
                cursor: "pointer",
                color: "#A32D2D",
              }}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const CallFlowsPage: React.FC = () => {
  const { user } = useAuth();

  const [flows, setFlows] = useState<CallFlow[]>([]);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveMsgType, setSaveMsgType] = useState<"ok" | "err" | "">("");
  const [isLoading, setIsLoading] = useState(true);

  // ── Firestore listener ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const ref = collection(db, "users", user.uid, "callFlows");
    const q = query(ref, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data: CallFlow[] = [];
        snap.forEach((d) => data.push({ id: d.id, ...d.data() } as CallFlow));
        setFlows(data);
        if (data.length > 0 && !activeFlowId) {
          setActiveFlowId(data[0].id);
        }
        setIsLoading(false);
      },
      () => setIsLoading(false),
    );
    return () => unsub();
  }, [activeFlowId, user]);

  const activeFlow = flows.find((f) => f.id === activeFlowId) ?? null;

  // ── Flow mutations (local state only until Save) ────────────────────────
  const mutateFlow = useCallback(
    (id: string, updater: (f: CallFlow) => CallFlow) => {
      setFlows((prev) => prev.map((f) => (f.id === id ? updater(f) : f)));
    },
    [],
  );

  const handleAddFlow = () => {
    const now = new Date().toISOString();
    const base = DEFAULT_FLOW();
    const newFlow: CallFlow = { ...base, createdAt: now, updatedAt: now };
    setFlows((prev) => [...prev, newFlow]);
    setActiveFlowId(newFlow.id);
    setEditingNodeId(null);
  };

  const handleDeleteFlow = async (id: string) => {
    if (flows.length <= 1) {
      flashMsg("You need at least one flow.", "err");
      return;
    }
    if (!window.confirm("Delete this flow? This cannot be undone.")) return;
    if (user) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "callFlows", id));
      } catch {
        // If not yet saved to Firestore, just remove locally
      }
    }
    setFlows((prev) => prev.filter((f) => f.id !== id));
    setActiveFlowId((prev) =>
      prev === id ? (flows.find((f) => f.id !== id)?.id ?? null) : prev,
    );
  };

  const handleToggleActive = (id: string) => {
    setFlows((prev) =>
      prev.map((f) => ({
        ...f,
        active: f.id === id ? !f.active : f.active,
      })),
    );
  };

  const handleFlowNameChange = (name: string) => {
    if (!activeFlowId) return;
    mutateFlow(activeFlowId, (f) => ({ ...f, name }));
  };

  // ── Node mutations ──────────────────────────────────────────────────────
  const handleAddNode = (type: NodeType) => {
    if (!activeFlowId) return;
    const meta = NodeTypeMeta(type);
    const newNode: FlowNode = {
      id: newNodeId(),
      type,
      title: meta.label,
      desc: meta.defaultDesc,
    };
    mutateFlow(activeFlowId, (f) => ({ ...f, nodes: [...f.nodes, newNode] }));
    setEditingNodeId(newNode.id);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!activeFlowId) return;
    mutateFlow(activeFlowId, (f) => ({
      ...f,
      nodes: f.nodes.filter((n) => n.id !== nodeId),
    }));
    if (editingNodeId === nodeId) setEditingNodeId(null);
  };

  const handleMoveNode = (nodeId: string, dir: -1 | 1) => {
    if (!activeFlowId) return;
    mutateFlow(activeFlowId, (f) => {
      const nodes = [...f.nodes];
      const i = nodes.findIndex((n) => n.id === nodeId);
      const ni = i + dir;
      if (ni < 0 || ni >= nodes.length) return f;
      [nodes[i], nodes[ni]] = [nodes[ni], nodes[i]];
      return { ...f, nodes };
    });
  };

  const handleNodeChange = (
    nodeId: string,
    field: keyof FlowNode,
    value: string,
  ) => {
    if (!activeFlowId) return;
    mutateFlow(activeFlowId, (f) => ({
      ...f,
      nodes: f.nodes.map((n) =>
        n.id === nodeId ? { ...n, [field]: value } : n,
      ),
    }));
  };

  // ── Save to Firestore ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user || !activeFlow) return;
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      await setDoc(doc(db, "users", user.uid, "callFlows", activeFlow.id), {
        ...activeFlow,
        updatedAt: now,
      });
      flashMsg("Flow saved successfully!", "ok");
    } catch (err: any) {
      flashMsg("Failed to save: " + err.message, "err");
    } finally {
      setIsSaving(false);
    }
  };

  const flashMsg = (msg: string, type: "ok" | "err") => {
    setSaveMsg(msg);
    setSaveMsgType(type);
    setTimeout(() => {
      setSaveMsg("");
      setSaveMsgType("");
    }, 3000);
  };

  // ── Render ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ padding: "0 20px 24px" }}>
        <div className="page-header">
          <h1>Call Flows</h1>
        </div>
        <div className="empty-state large">
          <div className="spinner-large" />
          <p>Loading your call flows…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 20px 24px" }}>
      {/* Page header */}
      <div className="page-header" style={{ marginBottom: 8 }}>
        <h1>Call Flows</h1>
        <p className="page-subtitle">
          Design how your AI routes and handles incoming calls — step by step.
        </p>
      </div>

      {/* Flow selector strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: "1.5rem",
        }}
      >
        {flows.map((f) => (
          <div
            key={f.id}
            onClick={() => {
              setActiveFlowId(f.id);
              setEditingNodeId(null);
            }}
            style={{
              background: "var(--color-background-primary)",
              border:
                f.id === activeFlowId
                  ? "1.5px solid #1D9E75"
                  : "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              padding: "1rem 1.25rem",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
              {f.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                marginBottom: 6,
              }}
            >
              {f.nodes.length} step{f.nodes.length !== 1 ? "s" : ""}
            </div>
            <span
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: "var(--border-radius-md)",
                background: f.active
                  ? "#E1F5EE"
                  : "var(--color-background-secondary)",
                color: f.active ? "#0F6E56" : "var(--color-text-secondary)",
                fontWeight: 500,
              }}
            >
              {f.active ? "● Active" : "Draft"}
            </span>
          </div>
        ))}

        {/* Add new flow card */}
        <button
          onClick={handleAddFlow}
          style={{
            background: "var(--color-background-secondary)",
            border: "0.5px dashed var(--color-border-secondary)",
            borderRadius: "var(--border-radius-lg)",
            padding: "1rem 1.25rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            color: "var(--color-text-secondary)",
            textAlign: "left",
          }}
        >
          <span style={{ fontSize: 18 }}>+</span> New Flow
        </button>
      </div>

      {/* Editor */}
      {activeFlow ? (
        <div
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            padding: "1.5rem",
          }}
        >
          {/* Editor header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            <input
              value={activeFlow.name}
              onChange={(e) => handleFlowNameChange(e.target.value)}
              style={{
                fontSize: 18,
                fontWeight: 500,
                flex: 1,
                border: "none",
                borderBottom: "1px solid transparent",
                background: "transparent",
                color: "var(--color-text-primary)",
                outline: "none",
                minWidth: 160,
                padding: "2px 0",
              }}
              onFocus={(e) =>
                (e.target.style.borderBottomColor =
                  "var(--color-border-secondary)")
              }
              onBlur={(e) => (e.target.style.borderBottomColor = "transparent")}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {/* Active toggle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                }}
              >
                <button
                  onClick={() => handleToggleActive(activeFlow.id)}
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 10,
                    background: activeFlow.active
                      ? "#1D9E75"
                      : "var(--color-border-secondary)",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 3,
                      left: activeFlow.active ? 19 : 3,
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left .2s",
                    }}
                  />
                </button>
                <span>{activeFlow.active ? "Active" : "Draft"}</span>
              </div>

              <button
                onClick={() => handleDeleteFlow(activeFlow.id)}
                className="save-btn"
                style={{
                  background: "transparent",
                  color: "#A32D2D",
                  border: "0.5px solid #F09595",
                  fontSize: 13,
                  padding: "6px 14px",
                }}
              >
                Delete flow
              </button>

              <button
                onClick={handleSave}
                className="save-btn"
                disabled={isSaving}
                style={{ fontSize: 13, padding: "6px 14px" }}
              >
                {isSaving ? (
                  <>
                    <span className="spinner-small" /> Saving…
                  </>
                ) : (
                  "💾 Save flow"
                )}
              </button>
            </div>
          </div>

          {/* Nodes */}
          {activeFlow.nodes.length === 0 ? (
            <div className="empty-state" style={{ padding: "2rem 1rem" }}>
              <span className="empty-icon">🔀</span>
              <p>No steps yet. Add your first step below.</p>
            </div>
          ) : (
            <div>
              {activeFlow.nodes.map((node, i) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  index={i}
                  total={activeFlow.nodes.length}
                  isEditing={editingNodeId === node.id}
                  onEdit={() => setEditingNodeId(node.id)}
                  onDone={() => setEditingNodeId(null)}
                  onDelete={() => handleDeleteNode(node.id)}
                  onMoveUp={() => handleMoveNode(node.id, -1)}
                  onMoveDown={() => handleMoveNode(node.id, 1)}
                  onChange={(field, value) =>
                    handleNodeChange(node.id, field, value)
                  }
                />
              ))}
            </div>
          )}

          {/* Add step buttons */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 8,
              paddingTop: 8,
              borderTop: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            {NODE_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => handleAddNode(t.value)}
                style={{
                  fontSize: 12,
                  padding: "5px 12px",
                  border: "0.5px dashed var(--color-border-secondary)",
                  borderRadius: "var(--border-radius-md)",
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--color-text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {t.icon} + {t.label}
              </button>
            ))}
          </div>

          {/* Save bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: "1.25rem",
              paddingTop: "1.25rem",
              borderTop: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            <span
              style={{
                fontSize: 13,
                flex: 1,
                color:
                  saveMsgType === "ok"
                    ? "#0F6E56"
                    : saveMsgType === "err"
                      ? "#A32D2D"
                      : "transparent",
              }}
            >
              {saveMsg || " "}
            </span>
            <span
              style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
            >
              {activeFlow.updatedAt
                ? `Last saved ${new Date(activeFlow.updatedAt).toLocaleString()}`
                : "Not yet saved"}
            </span>
          </div>
        </div>
      ) : (
        <div className="empty-state large">
          <span className="empty-icon">🔀</span>
          <h3>No flows yet</h3>
          <p>Create your first call flow to get started</p>
          <button className="setup-btn" onClick={handleAddFlow}>
            + Create Flow
          </button>
        </div>
      )}
    </div>
  );
};
