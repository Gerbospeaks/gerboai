import React, { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BillingData {
  plan: string;
  planName: string;
  status: "active" | "cancelled" | "past_due";
  minutesUsed: number;
  minutesLimit: number;
  callsThisMonth: number;
  callsLimit: number;
  assistantsLimit: number;
  balance: number;
  renewsAt: string;
}

export interface InvoiceRecord {
  date: string;
  description: string;
  amount: string;
  invoiceId: string;
}

interface BillingPageProps {
  userId: string;
  userEmail: string;
  getIdToken: () => Promise<string>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BILLING_WORKER_URL =
  process.env.REACT_APP_GERBO_BILLING_URL ||
  "https://billing-api.gerbospeaks.workers.dev";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "R299",
    priceNum: 299,
    popular: false,
    features: [
      "500 minutes / month",
      "200 calls / month",
      "1 AI assistant",
      "Call transcripts",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "R799",
    priceNum: 799,
    popular: true,
    features: [
      "2,000 minutes / month",
      "Unlimited calls",
      "3 AI assistants",
      "Call flows builder",
      "Advanced analytics",
      "Knowledge base (10 docs)",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    priceNum: 0,
    popular: false,
    features: [
      "Unlimited minutes",
      "Unlimited calls",
      "Unlimited assistants",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "SSO / SAML",
    ],
  },
];

const TOP_UPS = [
  { id: "topup_50", label: "R50", amount: 50 },
  { id: "topup_100", label: "R100", amount: 100 },
  { id: "topup_250", label: "R250", amount: 250 },
  { id: "topup_500", label: "R500", amount: 500 },
];

// ─── Design tokens — mirrors DashboardPages.tsx light theme ──────────────────

const T = {
  // surfaces
  surface: "var(--surface, #ffffff)",
  bgPage: "var(--bg-page, #f4f5f7)",
  bgSecondary: "var(--bg-secondary, #f8f9fb)",
  bgTertiary: "var(--bg-tertiary, #f0f2f5)",
  // borders
  border: "var(--border, #e2e6ea)",
  borderLight: "var(--border-light, #eef0f3)",
  // text
  textPrimary: "var(--text-primary, #111827)",
  textSecondary: "var(--text-secondary, #374151)",
  textMuted: "var(--text-muted, #6b7280)",
  textHint: "var(--text-hint, #9ca3af)",
  // brand
  primary: "var(--primary, #0078f0)",
  primaryHover: "var(--primary-hover, #0062cc)",
  primaryLight: "var(--primary-light, #e8f3fe)",
  // semantic
  success: "var(--success, #15803d)",
  successBg: "var(--success-bg, #dcfce7)",
  successBorder: "var(--success-border, #86efac)",
  error: "var(--error, #dc2626)",
  errorBg: "var(--error-bg, #fee2e2)",
  errorBorder: "var(--error-border, #fca5a5)",
  warning: "var(--warning, #b45309)",
  warningBg: "var(--warning-bg, #fef3c7)",
  warningBorder: "var(--warning-border, #fcd34d)",
  infoBg: "var(--info-bg, #e8f3fe)",
  infoBorder: "var(--info-border, #93c5fd)",
  // radii
  radius: "var(--radius, 8px)",
  radiusLg: "var(--radius-lg, 10px)",
  radiusFull: "var(--radius-full, 9999px)",
  // shadows
  shadowSm:
    "var(--shadow-sm, 0 1px 2px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.04))",
  shadowMd:
    "var(--shadow-md, 0 4px 6px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.05))",
  // font
  font: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', monospace",
};

// ─── Shared small components ──────────────────────────────────────────────────

type BadgeVariant = "green" | "yellow" | "red" | "blue" | "purple" | "muted";

const BADGE: Record<BadgeVariant, { bg: string; color: string }> = {
  green: { bg: "var(--success-bg,#dcfce7)", color: "var(--success,#15803d)" },
  yellow: { bg: "var(--warning-bg,#fef3c7)", color: "var(--warning,#b45309)" },
  red: { bg: "var(--error-bg,#fee2e2)", color: "var(--error,#dc2626)" },
  blue: { bg: "var(--info-bg,#e8f3fe)", color: "var(--primary,#0078f0)" },
  purple: { bg: "#ede9fe", color: "#6d28d9" },
  muted: {
    bg: "var(--bg-tertiary,#f0f2f5)",
    color: "var(--text-muted,#6b7280)",
  },
};

const Badge: React.FC<{
  variant: BadgeVariant;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ variant, children, style }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 9px",
      borderRadius: T.radiusFull,
      fontSize: 12,
      fontWeight: 600,
      background: BADGE[variant].bg,
      color: BADGE[variant].color,
      fontFamily: T.font,
      ...style,
    }}
  >
    {children}
  </span>
);

const Btn: React.FC<{
  variant?: "primary" | "ghost" | "danger";
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ variant = "ghost", onClick, disabled, style, children }) => {
  const variants = {
    primary: { background: T.primary, color: "#fff", border: "none" },
    ghost: {
      background: T.surface,
      color: T.textSecondary,
      border: `1px solid ${T.border}`,
    },
    danger: {
      background: T.errorBg,
      color: T.error,
      border: `1px solid ${T.errorBorder}`,
    },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: T.radius,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity .15s",
        fontFamily: T.font,
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
};

const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: T.radiusLg,
      padding: 20,
      marginBottom: 16,
      boxShadow: T.shadowSm,
      fontFamily: T.font,
      ...style,
    }}
  >
    {children}
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <h2
    style={{
      fontSize: 14,
      fontWeight: 700,
      color: T.textPrimary,
      borderBottom: `1px solid ${T.border}`,
      paddingBottom: 10,
      marginBottom: 14,
      fontFamily: T.font,
    }}
  >
    {children}
  </h2>
);

const PageHeader: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => (
  <div style={{ marginBottom: 24, fontFamily: T.font }}>
    <h1
      style={{
        fontSize: 18,
        fontWeight: 700,
        color: T.textPrimary,
        letterSpacing: "-0.01em",
      }}
    >
      {title}
    </h1>
    <p style={{ color: T.textMuted, marginTop: 3, fontSize: 13 }}>{subtitle}</p>
  </div>
);

// ─── UsageBar ─────────────────────────────────────────────────────────────────

const UsageBar: React.FC<{
  label: string;
  current: number;
  max: number;
  unit: string;
  color: string;
}> = ({ label, current, max, unit, color }) => {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const isHigh = pct >= 80;
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          fontSize: 13,
          fontFamily: T.font,
        }}
      >
        <span style={{ color: T.textSecondary, fontWeight: 500 }}>{label}</span>
        <span style={{ color: isHigh ? T.warning : T.textMuted, fontSize: 12 }}>
          {current.toLocaleString()} /{" "}
          {max === 999999 ? "∞" : max.toLocaleString()} {unit}
          {isHigh && " ⚠️"}
        </span>
      </div>
      <div
        style={{
          height: 8,
          background: T.bgTertiary,
          borderRadius: T.radiusFull,
          overflow: "hidden",
          border: `1px solid ${T.borderLight}`,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: isHigh ? T.warning : color,
            borderRadius: T.radiusFull,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
};

// ─── Checkout Modal ───────────────────────────────────────────────────────────

const CheckoutModal: React.FC<{
  planId: string;
  planName: string;
  price: number;
  isTopUp: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
  error: string;
}> = ({ planName, price, isTopUp, onConfirm, onCancel, isLoading, error }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }}
  >
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: 32,
        maxWidth: 440,
        width: "100%",
        boxShadow: T.shadowMd,
        fontFamily: T.font,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🛒</div>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: T.textPrimary,
            marginBottom: 4,
          }}
        >
          {isTopUp ? "Confirm Top-Up" : "Confirm Upgrade"}
        </h2>
        <p style={{ color: T.textMuted, fontSize: 13 }}>
          You'll be redirected to PayFast to complete payment securely.
        </p>
      </div>

      {/* Order summary */}
      <div
        style={{
          background: T.bgSecondary,
          border: `1px solid ${T.border}`,
          borderRadius: T.radiusLg,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span style={{ color: T.textMuted, fontSize: 13 }}>Item</span>
          <span style={{ color: T.textPrimary, fontSize: 13, fontWeight: 600 }}>
            Gerbo AI — {planName}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span style={{ color: T.textMuted, fontSize: 13 }}>
            {isTopUp ? "Credits" : "Billing"}
          </span>
          <span style={{ color: T.textSecondary, fontSize: 13 }}>
            {isTopUp ? "One-time top-up" : "Monthly subscription"}
          </span>
        </div>
        <div
          style={{
            borderTop: `1px solid ${T.border}`,
            paddingTop: 12,
            marginTop: 4,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>
            Total
          </span>
          <span style={{ color: T.success, fontWeight: 800, fontSize: 18 }}>
            R{price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Security note */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 20,
          padding: 10,
          background: T.successBg,
          borderRadius: T.radius,
          border: `1px solid ${T.successBorder}`,
        }}
      >
        <span>🔒</span>
        <span style={{ fontSize: 12, color: T.success }}>
          Payments are processed securely by PayFast. Your card details are
          never shared with us.
        </span>
      </div>

      {error && (
        <div
          style={{
            background: T.errorBg,
            border: `1px solid ${T.errorBorder}`,
            borderRadius: T.radius,
            padding: 10,
            marginBottom: 16,
            fontSize: 13,
            color: T.error,
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <Btn
          onClick={onCancel}
          disabled={isLoading}
          style={{ flex: 1, justifyContent: "center" }}
        >
          Cancel
        </Btn>
        <Btn
          variant="primary"
          onClick={onConfirm}
          disabled={isLoading}
          style={{ flex: 2, justifyContent: "center" }}
        >
          {isLoading ? "⏳ Redirecting…" : "💳 Pay with PayFast →"}
        </Btn>
      </div>
    </div>
  </div>
);

// ─── Main BillingPage ─────────────────────────────────────────────────────────

export const BillingPage: React.FC<BillingPageProps> = ({
  userId,
  userEmail,
  getIdToken,
}) => {
  const [billingData, setBillingData] = useState<BillingData>({
    plan: "starter",
    planName: "Starter",
    status: "active",
    minutesUsed: 0,
    minutesLimit: 500,
    callsThisMonth: 0,
    callsLimit: 200,
    assistantsLimit: 1,
    balance: 0,
    renewsAt: "",
  });
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [cartItem, setCartItem] = useState<{
    id: string;
    name: string;
    price: number;
    isTopUp: boolean;
  } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

 
  const loadBillingData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError("");
      const idToken = await getIdToken();
      const res = await fetch(`${BILLING_WORKER_URL}/billing-status`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = (await res.json()) as {
        success: boolean;
        billing: BillingData;
        invoices: InvoiceRecord[];
        error?: string;
      };
      if (data.success) {
        setBillingData(data.billing);
        setInvoices(data.invoices);
      } else {
        setLoadError(data.error ?? "Failed to load billing data");
      }
    } catch (err: any) {
      setLoadError("Network error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [getIdToken]);
 useEffect(() => {
    if (!userId) return;
    loadBillingData();
  }, [loadBillingData, userId]);

  const addToCart = (
    id: string,
    name: string,
    price: number,
    isTopUp: boolean,
  ) => {
    setCartItem({ id, name, price, isTopUp });
    setCheckoutError("");
  };

  const handleCheckout = async () => {
    if (!cartItem) return;
    setIsCheckingOut(true);
    setCheckoutError("");
    try {
      const idToken = await getIdToken();
      const res = await fetch(`${BILLING_WORKER_URL}/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          planId: cartItem.id,
          email: userEmail,
        }),
      });
      const data = (await res.json()) as {
        success: boolean;
        redirectUrl?: string;
        error?: string;
      };
      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setCheckoutError(data.error ?? "Failed to initiate payment");
        setIsCheckingOut(false);
      }
    } catch (err: any) {
      setCheckoutError("Network error: " + err.message);
      setIsCheckingOut(false);
    }
  };

  const formatRenewal = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const currentPlan = PLANS.find((p) => p.id === billingData.plan) ?? PLANS[0];

  if (isLoading) {
    return (
      <div
        style={{
          padding: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
          fontFamily: T.font,
        }}
      >
        <div style={{ textAlign: "center", color: T.textMuted }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <p style={{ fontSize: 13 }}>Loading billing data…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 20px 24px", fontFamily: T.font }}>
      {cartItem && (
        <CheckoutModal
          planId={cartItem.id}
          planName={cartItem.name}
          price={cartItem.price}
          isTopUp={cartItem.isTopUp}
          onConfirm={handleCheckout}
          onCancel={() => {
            setCartItem(null);
            setCheckoutError("");
          }}
          isLoading={isCheckingOut}
          error={checkoutError}
        />
      )}

      <PageHeader
        title="Billing & Subscription"
        subtitle="Manage your plan, usage, and payment details"
      />

      {loadError && (
        <div
          style={{
            background: T.errorBg,
            border: `1px solid ${T.errorBorder}`,
            borderRadius: T.radius,
            padding: 12,
            marginBottom: 16,
            fontSize: 13,
            color: T.error,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          ❌ {loadError}
          <Btn
            onClick={loadBillingData}
            style={{ fontSize: 12, padding: "4px 10px" }}
          >
            Retry
          </Btn>
        </div>
      )}

      {/* Balance + Current Plan */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Account Balance */}
        <Card>
          <h3
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: T.textMuted,
              textTransform: "uppercase",
              letterSpacing: ".07em",
              marginBottom: 12,
            }}
          >
            Account Balance
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 40,
                fontWeight: 800,
                color: T.textPrimary,
                letterSpacing: "-0.02em",
              }}
            >
              R{billingData.balance.toFixed(2)}
            </div>
            <div style={{ fontSize: 13, color: T.textMuted, paddingBottom: 8 }}>
              ZAR
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop: `1px solid ${T.border}`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: T.textMuted,
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              Quick Top-Up
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TOP_UPS.map((t) => (
                <Btn
                  key={t.id}
                  variant="primary"
                  style={{ fontSize: 12, padding: "5px 10px" }}
                  onClick={() =>
                    addToCart(t.id, `Top-Up ${t.label}`, t.amount, true)
                  }
                >
                  {t.label}
                </Btn>
              ))}
            </div>
          </div>
        </Card>

        {/* Current Plan */}
        <Card>
          <h3
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: T.textMuted,
              textTransform: "uppercase",
              letterSpacing: ".07em",
              marginBottom: 12,
            }}
          >
            Current Plan
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: T.textPrimary,
                  letterSpacing: "-0.01em",
                }}
              >
                {billingData.planName}
              </div>
              <Badge
                variant={
                  billingData.status === "active"
                    ? "green"
                    : billingData.status === "past_due"
                      ? "yellow"
                      : "red"
                }
                style={{ marginTop: 4 }}
              >
                {billingData.status === "active"
                  ? "● Active"
                  : billingData.status === "past_due"
                    ? "⚠ Past Due"
                    : "● Cancelled"}
              </Badge>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: T.textPrimary,
                  letterSpacing: "-0.01em",
                }}
              >
                {currentPlan.price}
                {currentPlan.price !== "Custom" && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 400,
                      color: T.textMuted,
                    }}
                  >
                    /mo
                  </span>
                )}
              </div>
              {billingData.renewsAt && (
                <div style={{ fontSize: 12, color: T.textMuted }}>
                  Renews {formatRenewal(billingData.renewsAt)}
                </div>
              )}
            </div>
          </div>

          <UsageBar
            label="Minutes Used"
            current={billingData.minutesUsed}
            max={billingData.minutesLimit}
            unit="min"
            color={T.primary}
          />
          <UsageBar
            label="Calls This Month"
            current={billingData.callsThisMonth}
            max={billingData.callsLimit}
            unit=""
            color={T.success}
          />
          <UsageBar
            label="AI Assistants"
            current={1}
            max={billingData.assistantsLimit}
            unit=""
            color={T.warning}
          />

          {billingData.plan !== "business" &&
            billingData.plan !== "enterprise" && (
              <Btn
                variant="primary"
                style={{
                  marginTop: 8,
                  width: "100%",
                  justifyContent: "center",
                }}
                onClick={() => addToCart("business", "Business", 799, false)}
              >
                ⚡ Upgrade to Business →
              </Btn>
            )}
        </Card>
      </div>

      {/* Plan Cards */}
      <Card>
        <SectionTitle>Available Plans</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {PLANS.map((plan) => {
            const isCurrent = billingData.plan === plan.id;
            return (
              <div
                key={plan.id}
                style={{
                  background: T.bgSecondary,
                  border: `2px solid ${plan.popular ? T.primary : isCurrent ? T.success : T.border}`,
                  borderRadius: T.radiusLg,
                  padding: 22,
                  position: "relative",
                }}
              >
                {plan.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: -10,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: T.primary,
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 12px",
                      borderRadius: T.radiusFull,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Most Popular
                  </div>
                )}
                {isCurrent && (
                  <div
                    style={{
                      position: "absolute",
                      top: -10,
                      right: 16,
                      background: T.success,
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 12px",
                      borderRadius: T.radiusFull,
                    }}
                  >
                    ✓ Current
                  </div>
                )}
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                    marginBottom: 8,
                  }}
                >
                  {plan.name}
                </div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    color: T.textPrimary,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {plan.price}
                  {plan.price !== "Custom" && (
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 400,
                        color: T.textMuted,
                      }}
                    >
                      /mo
                    </span>
                  )}
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    margin: "16px 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        fontSize: 13,
                        color: T.textSecondary,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ color: T.success, fontWeight: 700 }}>
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Btn
                    style={{ width: "100%", justifyContent: "center" }}
                    disabled
                  >
                    Current Plan
                  </Btn>
                ) : plan.id === "enterprise" ? (
                  <Btn style={{ width: "100%", justifyContent: "center" }}>
                    Contact Sales
                  </Btn>
                ) : (
                  <Btn
                    variant="primary"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() =>
                      addToCart(plan.id, plan.name, plan.priceNum, false)
                    }
                  >
                    {billingData.plan === "business" && plan.id === "starter"
                      ? "Downgrade"
                      : "Upgrade →"}
                  </Btn>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Invoices */}
      <Card>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <SectionTitle>Invoice History</SectionTitle>
          <Btn
            onClick={loadBillingData}
            style={{ fontSize: 12, padding: "5px 10px" }}
          >
            🔄 Refresh
          </Btn>
        </div>

        {invoices.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px 0",
              color: T.textMuted,
              fontSize: 13,
            }}
          >
            No invoices yet. Your payment history will appear here.
          </div>
        ) : (
          invoices.map((inv, i) => (
            <div
              key={inv.invoiceId || i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom:
                  i < invoices.length - 1
                    ? `1px solid ${T.borderLight}`
                    : "none",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: T.textMuted,
                  minWidth: 80,
                  fontFamily: T.fontMono,
                }}
              >
                {inv.date}
              </span>
              <span style={{ flex: 1, fontSize: 13, color: T.textSecondary }}>
                {inv.description}
              </span>
              <span style={{ fontWeight: 700, fontSize: 14, color: T.success }}>
                {inv.amount}
              </span>
              <Badge variant="green" style={{ fontSize: 11 }}>
                Paid
              </Badge>
            </div>
          ))
        )}
      </Card>

      {/* VAT notice */}
      <p
        style={{
          fontSize: 11,
          color: T.textHint,
          textAlign: "center",
          marginTop: 8,
          fontFamily: T.font,
        }}
      >
        All prices are in South African Rand (ZAR) and exclude VAT where
        applicable. Payments are processed by PayFast. By upgrading you agree to
        our Terms of Service.
      </p>
    </div>
  );
};
