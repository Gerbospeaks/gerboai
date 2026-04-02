import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase"; 
// ─── Gateway definitions ───────────────────────────────────────────────────────
const GATEWAYS = [
  {
    id: "payfast",
    label: "PayFast",
    region: "za",
    desc: "South Africa's most popular payment gateway",
    abbr: "PF",
    color: "#E1F5EE",
    textColor: "#0F6E56",
    fields: [
      { key: "merchant_id", label: "Merchant ID", placeholder: "10000100" },
      {
        key: "merchant_key",
        label: "Merchant key",
        placeholder: "q1cd2rdny4a53",
      },
      {
        key: "passphrase",
        label: "Passphrase",
        placeholder: "Your passphrase",
        type: "password",
      },
    ],
    hint: "Find these in your PayFast dashboard under Integration > Merchant Details.",
    info: "Clients will see a Pay with PayFast button on invoices. Supports card, EFT & SnapScan.",
    docsUrl: "https://developers.payfast.co.za/docs",
  },
  {
    id: "yoco",
    label: "Yoco",
    region: "za",
    desc: "Simple card payments for South African businesses",
    abbr: "YC",
    color: "#FAEEDA",
    textColor: "#854F0B",
    fields: [
      {
        key: "secret_key",
        label: "Secret key",
        placeholder: "sk_live_...",
        type: "password",
      },
      { key: "public_key", label: "Public key", placeholder: "pk_live_..." },
    ],
    hint: "Find your keys in the Yoco business portal under Developers > API Keys.",
    info: "Clients can pay by card directly on a hosted Yoco checkout page.",
    docsUrl: "https://developer.yoco.com/online/resources/sdks-plugins",
  },
  {
    id: "stripe",
    label: "Stripe",
    region: "intl",
    desc: "Global card payments, used in 195+ countries",
    abbr: "ST",
    color: "#E6F1FB",
    textColor: "#185FA5",
    fields: [
      {
        key: "secret_key",
        label: "Secret key",
        placeholder: "sk_live_...",
        type: "password",
      },
      {
        key: "publishable_key",
        label: "Publishable key",
        placeholder: "pk_live_...",
      },
      {
        key: "webhook_secret",
        label: "Webhook secret (optional)",
        placeholder: "whsec_...",
        type: "password",
      },
    ],
    hint: "Get your keys at dashboard.stripe.com > Developers > API keys.",
    info: "Supports cards, Apple Pay & Google Pay. Funds paid out in USD/EUR.",
    docsUrl: "https://stripe.com/docs/keys",
  },
  {
    id: "paypal",
    label: "PayPal",
    region: "intl",
    desc: "PayPal checkout for international clients",
    abbr: "PP",
    color: "#EEEDFE",
    textColor: "#3C3489",
    fields: [
      { key: "client_id", label: "Client ID", placeholder: "AaBbCc..." },
      {
        key: "client_secret",
        label: "Client secret",
        placeholder: "EeFfGg...",
        type: "password",
      },
    ],
    hint: "Create credentials at developer.paypal.com > Apps & Credentials.",
    info: "Clients can pay via PayPal balance, card or bank account.",
    docsUrl: "https://developer.paypal.com/api/rest/",
  },
];

// ─── Single gateway card ───────────────────────────────────────────────────────
function GatewayCard({ gateway, saved, onSave }) {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(saved?.enabled ?? false);
  const [fields, setFields] = useState(() => {
    const init = {};
    gateway.fields.forEach((f) => {
      init[f.key] = saved?.[f.key] ?? "";
    });
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  function handleToggle(e) {
    e.stopPropagation();
    const next = !enabled;
    setEnabled(next);
    if (next && !open) setOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    await onSave(gateway.id, { ...fields, enabled });
    setSaving(false);
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2500);
  }

  return (
    <div
      style={{
        background: "var(--color-bg, #fff)",
        border: enabled
          ? "1.5px solid #378ADD"
          : "0.5px solid rgba(0,0,0,0.12)",
        borderRadius: 12,
        overflow: "hidden",
        transition: "border-color 0.15s",
      }}
    >
      {/* Header row */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 18px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: gateway.color,
            color: gateway.textColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          {gateway.abbr}
        </div>

        {/* Name + desc */}
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 500, fontSize: 14, margin: 0 }}>
            {gateway.label}
          </p>
          <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>
            {gateway.desc}
          </p>
        </div>

        {/* Badge + toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              padding: "3px 8px",
              borderRadius: 20,
              background: gateway.region === "za" ? "#EAF3DE" : "#f3f4f6",
              color: gateway.region === "za" ? "#3B6D11" : "#6b7280",
            }}
          >
            {gateway.region === "za" ? "SA" : "Global"}
          </span>
          {/* Toggle switch */}
          <button
            onClick={handleToggle}
            style={{
              width: 36,
              height: 20,
              borderRadius: 20,
              background: enabled ? "#1D9E75" : "rgba(0,0,0,0.15)",
              border: "none",
              cursor: "pointer",
              position: "relative",
              flexShrink: 0,
              transition: "background 0.2s",
            }}
          >
            <span
              style={{
                position: "absolute",
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#fff",
                top: 2,
                left: enabled ? 18 : 2,
                transition: "left 0.2s",
              }}
            />
          </button>
        </div>
      </div>

      {/* Expandable form */}
      {open && (
        <div
          style={{
            padding: "0 18px 18px",
            borderTop: "0.5px solid rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 10,
              marginTop: 14,
              gridTemplateColumns:
                gateway.fields.length >= 3 ? "1fr 1fr" : "1fr",
            }}
          >
            {gateway.fields.map((f) => (
              <div
                key={f.key}
                style={
                  gateway.fields.length >= 3 && f === gateway.fields[0]
                    ? { gridColumn: "1 / -1" }
                    : {}
                }
              >
                <label
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  {f.label}
                </label>
                <input
                  type={f.type || "text"}
                  placeholder={f.placeholder}
                  value={fields[f.key]}
                  onChange={(e) =>
                    setFields((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    height: 36,
                    border: "0.5px solid rgba(0,0,0,0.15)",
                    borderRadius: 8,
                    padding: "0 10px",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>
            ))}
          </div>

          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
            {gateway.hint}{" "}
            <a
              href={gateway.docsUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#378ADD" }}
            >
              View docs
            </a>
          </p>

          <div
            style={{
              background: "#EBF5FF",
              borderRadius: 8,
              padding: "10px 12px",
              marginTop: 10,
              fontSize: 12,
              color: "#185FA5",
              lineHeight: 1.5,
            }}
          >
            {gateway.info}
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginTop: 14,
            }}
          >
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                height: 34,
                padding: "0 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                background: "#1a2332",
                color: "#fff",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Saving..." : "Save credentials"}
            </button>

            {savedOk && (
              <span
                style={{
                  fontSize: 12,
                  color: "#1D9E75",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                ✓ Saved
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function PaymentGatewaySettings() {
  const [gatewayData, setGatewayData] = useState({});
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid;

  // Load saved credentials from Firestore
  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, "users", uid, "settings", "paymentGateways")).then(
      (snap) => {
        if (snap.exists()) setGatewayData(snap.data());
        setLoading(false);
      },
    );
  }, [uid]);

  // Save a single gateway's credentials
  async function handleSave(gatewayId, fields) {
    if (!uid) return;
    const updated = { ...gatewayData, [gatewayId]: fields };
    setGatewayData(updated);
    await setDoc(
      doc(db, "users", uid, "settings", "paymentGateways"),
      updated,
      { merge: true },
    );
  }

  const saGateways = GATEWAYS.filter((g) => g.region === "za");
  const intlGateways = GATEWAYS.filter((g) => g.region === "intl");

  if (loading) {
    return (
      <p style={{ fontSize: 14, color: "#9ca3af", padding: "2rem 0" }}>
        Loading...
      </p>
    );
  }

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Promo banner */}
      <div
        style={{
          background: "#f9fafb",
          border: "0.5px solid rgba(0,0,0,0.08)",
          borderRadius: 12,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "#EBF5FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          💳
        </div>
        <div>
          <p style={{ fontWeight: 500, fontSize: 15, margin: "0 0 3px" }}>
            Want to get paid faster?
          </p>
          <p
            style={{
              fontSize: 13,
              color: "#6b7280",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Configure a payment gateway and your clients will see a{" "}
            <strong>Pay Now</strong> button on every invoice you send.
          </p>
        </div>
      </div>

      {/* SA gateways */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 10,
        }}
      >
        South Africa
      </p>
      <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
        {saGateways.map((gw) => (
          <GatewayCard
            key={gw.id}
            gateway={gw}
            saved={gatewayData[gw.id]}
            onSave={handleSave}
          />
        ))}
      </div>

      {/* International gateways */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 10,
        }}
      >
        International
      </p>
      <div style={{ display: "grid", gap: 12 }}>
        {intlGateways.map((gw) => (
          <GatewayCard
            key={gw.id}
            gateway={gw}
            saved={gatewayData[gw.id]}
            onSave={handleSave}
          />
        ))}
      </div>
    </div>
  );
}
