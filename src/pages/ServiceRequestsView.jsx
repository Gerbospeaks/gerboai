import React, { useState } from "react";

// ─── Industry label map ───────────────────────────────────────────────────────
const INDUSTRY_LABELS = {
  mechanics: "Mechanical",
  electrical: "Electrical",
  carpentry: "Carpentry",
  plumbing: "Plumbing",
  logistics: "Logistics",
  construction: "Construction",
  accounting: "Accounting",
  cleaning: "Cleaning",
  education: "Education",
  health: "Healthcare",
  hotel: "Hospitality",
  hvac: "HVAC",
  landscaping: "Landscaping",
  legal: "Legal",
  painting: "Painting",
  "pest-control": "Pest Control",
  photography: "Photography",
  "pool-services": "Pool Services",
  realestate: "Real Estate",
  restaurants: "Restaurants",
  retail: "Retail",
  security: "Security",
  "solar-installation": "Solar",
  towing: "Towing",
  welding: "Welding",
  flooring: "Flooring",
  "window-repair": "Window Repair",
};

const URGENCY_STYLES = {
  "Urgent (today/tomorrow)": { background: "#fee2e2", color: "#991b1b" },
  "Standard (2-3 days)": { background: "#dbeafe", color: "#1e40af" },
  "Flexible (within a week)": { background: "#f0fdf4", color: "#166534" },
};

// ─── Sample incoming requests ─────────────────────────────────────────────────
const SAMPLE_REQUESTS = [
  {
    id: "r1",
    from: "SparkleClean Pro",
    fromIndustry: "cleaning",
    service: "Fleet vehicle servicing — 4 vans due for 10 000 km service",
    address: "14 Industrial Road, Boksburg",
    date: "2025-08-18",
    time: "08:00",
    urgency: "Standard (2-3 days)",
    attachedDoc: "New purchase order",
    receivedAt: "2 hours ago",
    status: "new",
  },
  {
    id: "r2",
    from: "BuildRight Construction",
    fromIndustry: "construction",
    service: "Electrical COC required for new commercial premises, 3-phase DB",
    address: "Plot 22, Pretoria North Industrial",
    date: "2025-08-19",
    time: "07:30",
    urgency: "Urgent (today/tomorrow)",
    attachedDoc: "Current quote",
    receivedAt: "Yesterday",
    status: "quoted",
    quoteAmount: "R3 200",
  },
  {
    id: "r3",
    from: "ClearBooks Accounting",
    fromIndustry: "accounting",
    service: "Monthly bookkeeping catchup — 6 months behind, Xero setup needed",
    address: "Online / remote",
    date: "2025-08-20",
    time: "10:00",
    urgency: "Flexible (within a week)",
    attachedDoc: "None",
    receivedAt: "3 days ago",
    status: "accepted",
  },
];

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  new: { label: "New request", bg: "#ede9fe", color: "#5b21b6" },
  quoted: { label: "Quote sent", bg: "#fef3c7", color: "#92400e" },
  accepted: { label: "Accepted", bg: "#dcfce7", color: "#166534" },
  declined: { label: "Declined", bg: "#fee2e2", color: "#991b1b" },
};

// ─── Single request card ──────────────────────────────────────────────────────
function RequestCard({ req, onRespond }) {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS[req.status];
  const urgencyStyle = URGENCY_STYLES[req.urgency] || {};

  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border:
          req.status === "new"
            ? "1.5px solid #7c3aed"
            : "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        marginBottom: 10,
        overflow: "hidden",
      }}
    >
      {/* Header row */}
      <div
        onClick={() => setExpanded((e) => !e)}
        style={{
          padding: "12px 14px",
          cursor: "pointer",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--border-radius-md)",
            background: "#ede9fe",
            color: "#7c3aed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          📥
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                }}
              >
                {req.from}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-text-tertiary)",
                  marginTop: 1,
                }}
              >
                {INDUSTRY_LABELS[req.fromIndustry]} · Received {req.receivedAt}
              </div>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: "3px 10px",
                borderRadius: 20,
                background: st.bg,
                color: st.color,
                whiteSpace: "nowrap",
              }}
            >
              {st.label}
            </span>
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "var(--color-text-secondary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: expanded ? "normal" : "nowrap",
            }}
          >
            {req.service}
          </div>

          <div
            style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: "2px 8px",
                borderRadius: 20,
                ...urgencyStyle,
              }}
            >
              {req.urgency}
            </span>
            {req.attachedDoc !== "None" && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "2px 8px",
                  borderRadius: 20,
                  background: "#dbeafe",
                  color: "#1e40af",
                }}
              >
                📎 {req.attachedDoc}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div
          style={{
            padding: "0 14px 14px 14px",
            borderTop: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 12,
              marginBottom: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                  marginBottom: 3,
                }}
              >
                Date requested
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text-primary)" }}>
                {req.date} at {req.time}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                  marginBottom: 3,
                }}
              >
                Address
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text-primary)" }}>
                {req.address}
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
              marginBottom: 12,
              background: "var(--color-background-secondary)",
              padding: "10px 12px",
              borderRadius: "var(--border-radius-md)",
            }}
          >
            {req.service}
          </div>

          {req.quoteAmount && (
            <div
              style={{
                marginBottom: 12,
                fontSize: 13,
                color: "#0891b2",
                fontWeight: 500,
              }}
            >
              Your quote: {req.quoteAmount}
            </div>
          )}

          {(req.status === "new" || req.status === "quoted") && (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => onRespond(req, "respond")}
                style={{
                  flex: 1,
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "8px 12px",
                  borderRadius: "var(--border-radius-md)",
                  background: "#0891b2",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {req.status === "new" ? "Send a quote" : "Update quote"}
              </button>
              <button
                onClick={() => onRespond(req, "accept")}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "8px 12px",
                  borderRadius: "var(--border-radius-md)",
                  background: "#059669",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Accept job
              </button>
              <button
                onClick={() => onRespond(req, "decline")}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "8px 12px",
                  borderRadius: "var(--border-radius-md)",
                  background: "var(--color-background-secondary)",
                  color: "var(--color-text-secondary)",
                  border: "0.5px solid var(--color-border-secondary)",
                  cursor: "pointer",
                }}
              >
                Decline
              </button>
            </div>
          )}

          {req.status === "accepted" && (
            <div
              style={{
                fontSize: 12,
                color: "#166534",
                background: "#dcfce7",
                padding: "8px 12px",
                borderRadius: "var(--border-radius-md)",
              }}
            >
              ✓ Job accepted — this request has been added to your jobs queue.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Quote modal ──────────────────────────────────────────────────────────────
function QuoteModal({ req, onClose, onSend }) {
  const [amount, setAmount] = useState(req.quoteAmount || "");
  const [notes, setNotes] = useState("");

  const inputStyle = {
    fontSize: 13,
    padding: "8px 10px",
    borderRadius: "var(--border-radius-md)",
    border: "0.5px solid var(--color-border-secondary)",
    background: "var(--color-background-secondary)",
    color: "var(--color-text-primary)",
    width: "100%",
    outline: "none",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        style={{
          background: "var(--color-background-primary)",
          borderRadius: "var(--border-radius-lg)",
          padding: 20,
          width: "100%",
          maxWidth: 420,
          border: "0.5px solid var(--color-border-secondary)",
          boxShadow: "0 8px 32px rgba(0,0,0,.16)",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--color-text-primary)",
            marginBottom: 4,
          }}
        >
          Send a quote
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--color-text-secondary)",
            marginBottom: 16,
          }}
        >
          To: {req.from} · {req.service.slice(0, 60)}…
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: ".05em",
              display: "block",
              marginBottom: 4,
            }}
          >
            Quote amount (R)
          </label>
          <input
            type="text"
            placeholder="e.g. R1 800 or R450/hr × 3hrs"
            style={inputStyle}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: ".05em",
              display: "block",
              marginBottom: 4,
            }}
          >
            Notes to client (optional)
          </label>
          <textarea
            placeholder="Inclusions, exclusions, lead times…"
            style={{ ...inputStyle, resize: "vertical", minHeight: 64 }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              fontSize: 13,
              fontWeight: 500,
              padding: "9px 16px",
              borderRadius: "var(--border-radius-md)",
              background: "var(--color-background-secondary)",
              color: "var(--color-text-secondary)",
              border: "0.5px solid var(--color-border-secondary)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSend(req, amount, notes)}
            style={{
              flex: 1,
              fontSize: 13,
              fontWeight: 500,
              padding: 9,
              borderRadius: "var(--border-radius-md)",
              background: "#0891b2",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Send quote
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ServiceRequestsView({ user, businessInfo }) {
  const [requests, setRequests] = useState(SAMPLE_REQUESTS);
  const [quoteTarget, setQuoteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState("all");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleRespond = (req, action) => {
    if (action === "respond") {
      setQuoteTarget(req);
    } else if (action === "accept") {
      setRequests((rs) =>
        rs.map((r) => (r.id === req.id ? { ...r, status: "accepted" } : r)),
      );
      showToast(`Job from ${req.from} accepted — added to your jobs queue.`);
    } else if (action === "decline") {
      setRequests((rs) =>
        rs.map((r) => (r.id === req.id ? { ...r, status: "declined" } : r)),
      );
      showToast(`Request from ${req.from} declined.`);
    }
  };

  const handleSendQuote = (req, amount, notes) => {
    setRequests((rs) =>
      rs.map((r) =>
        r.id === req.id ? { ...r, status: "quoted", quoteAmount: amount } : r,
      ),
    );
    setQuoteTarget(null);
    showToast(`Quote of ${amount} sent to ${req.from}.`);
  };

  const FILTERS = [
    { id: "all", label: "All" },
    { id: "new", label: "New" },
    { id: "quoted", label: "Quoted" },
    { id: "accepted", label: "Accepted" },
    { id: "declined", label: "Declined" },
  ];

  const displayed =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const newCount = requests.filter((r) => r.status === "new").length;

  return (
    <div style={{ position: "relative" }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#059669",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
            padding: "10px 18px",
            borderRadius: 999,
            zIndex: 9999,
            whiteSpace: "nowrap",
            boxShadow: "0 4px 16px rgba(0,0,0,.15)",
          }}
        >
          {toast}
        </div>
      )}

      {/* Quote modal */}
      {quoteTarget && (
        <QuoteModal
          req={quoteTarget}
          onClose={() => setQuoteTarget(null)}
          onSend={handleSendQuote}
        />
      )}

      {/* Header */}
      <div
        style={{
          background: "var(--color-background-primary)",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: "var(--border-radius-lg) var(--border-radius-lg) 0 0",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--color-text-primary)",
            }}
          >
            Incoming service requests
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              marginTop: 1,
            }}
          >
            Cross-industry bookings from other businesses on the platform
          </div>
        </div>
        {newCount > 0 && (
          <div
            style={{
              background: "#7c3aed",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 999,
            }}
          >
            {newCount} new
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div
        style={{
          background: "var(--color-background-primary)",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          padding: "8px 16px",
          display: "flex",
          gap: 4,
        }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: "4px 12px",
              borderRadius: 20,
              background: filter === f.id ? "#0891b2" : "transparent",
              color: filter === f.id ? "#fff" : "var(--color-text-secondary)",
              border: "none",
              cursor: "pointer",
              transition: "all .15s",
            }}
          >
            {f.label}
            {f.id === "new" && newCount > 0 && (
              <span
                style={{
                  marginLeft: 4,
                  background:
                    filter === "new" ? "rgba(255,255,255,.3)" : "#7c3aed",
                  color: "#fff",
                  fontSize: 10,
                  padding: "1px 5px",
                  borderRadius: 999,
                }}
              >
                {newCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 16 }}>
        {displayed.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px 16px",
              background: "var(--color-background-primary)",
              borderRadius: "var(--border-radius-lg)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--color-text-primary)",
                marginBottom: 4,
              }}
            >
              No {filter !== "all" ? filter : ""} requests
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
              When another business books your service, requests will appear
              here.
            </div>
          </div>
        ) : (
          displayed.map((req) => (
            <RequestCard key={req.id} req={req} onRespond={handleRespond} />
          ))
        )}
      </div>

      {/* Summary footer */}
      <div
        style={{
          padding: "10px 16px",
          borderTop: "0.5px solid var(--color-border-tertiary)",
          display: "flex",
          gap: 16,
          fontSize: 12,
          color: "var(--color-text-secondary)",
        }}
      >
        {Object.entries(STATUS).map(([key, val]) => {
          const count = requests.filter((r) => r.status === key).length;
          return count > 0 ? (
            <span
              key={key}
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: val.color,
                  display: "inline-block",
                }}
              />
              {count} {val.label.toLowerCase()}
            </span>
          ) : null;
        })}
      </div>
    </div>
  );
}
