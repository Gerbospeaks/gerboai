
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// ── Plan hierarchy ────────────────────────────────────────────────────────────
export const PLAN_ORDER = ["starter", "growth", "elite"];

export const PLANS = {
  starter: {
    label: "Starter",
    price: "Free",
    period: "",
    desc: "Perfect for getting started",
    highlight: false,
    features: [
      "Create & save invoices",
      "Manual entry form",
      "Basic invoice preview",
      "Print invoices",
      "1 business profile",
    ],
    cta: "Current plan",
  },
  growth: {
    label: "Growth",
    price: "R299",
    period: "/ mo",
    desc: "For photographers booking consistently",
    highlight: true,
    features: [
      "Everything in Starter",
      "Unlimited clients & invoices",
      "All invoice templates",
      "AI invoice generation",
      "PDF export & email sending",
      "Client management portal",
      "Pending-payment tracking",
    ],
    cta: "Upgrade to Growth",
  },
  elite: {
    label: "Elite",
    price: "R599",
    period: "/ mo",
    desc: "Full studio management suite",
    highlight: false,
    features: [
      "Everything in Growth",
      "Bookings & calendar",
      "Portfolio management",
      "Packages & pricing builder",
      "Payment processing",
      "Reports & analytics",
      "Signature & stamp tools",
      "Priority support",
    ],
    cta: "Upgrade to Elite",
  },
};

// ── Feature → minimum required plan map ──────────────────────────────────────
export const FEATURE_PLAN = {
  // Starter (free)
  home: "starter",
  createInvoice: "starter",
  manualEntry: "starter",
  printInvoice: "starter",
  saveInvoice: "starter",

  // Growth
  allInvoices: "growth",
  allClients: "growth",
  addClient: "growth",
  templates: "growth",
  aiMode: "growth",
  savePDF: "growth",
  sendInvoice: "growth",
  previewInvoice: "growth",

  // Elite
  bookings: "elite",
  portfolio: "elite",
  packages: "elite",
  payments: "elite",
  reports: "elite",
  analytics: "elite",
  signatureStamp: "elite",
  businessOverview: "elite",
  convertToInvoice: "elite",
};

// ── Context ───────────────────────────────────────────────────────────────────
const PlanContext = createContext(null);

export const PlanProvider = ({ children, initialPlan = "starter" }) => {
  const [currentPlan, setCurrentPlan] = useState(initialPlan);
  const [upgradeModal, setUpgradeModal] = useState({
    open: false,
    requiredPlan: "growth",
    featureLabel: "",
  });

  // Persist plan selection (swap for real auth/firestore lookup in production)
  useEffect(() => {
    const saved = localStorage.getItem("sf_plan");
    if (saved && PLAN_ORDER.includes(saved)) setCurrentPlan(saved);
  }, []);

  const canAccess = useCallback(
    (featureKey) => {
      const required = FEATURE_PLAN[featureKey] ?? "starter";
      return PLAN_ORDER.indexOf(currentPlan) >= PLAN_ORDER.indexOf(required);
    },
    [currentPlan],
  );

  /**
   * Gate an action.
   * @param {string} featureKey   – key from FEATURE_PLAN
   * @param {Function} action     – runs only if plan is sufficient
   * @param {string} [label]      – human-readable name shown in the modal
   */
  const requirePlan = useCallback(
    (featureKey, action, label = "") => {
      if (canAccess(featureKey)) {
        action?.();
      } else {
        const required = FEATURE_PLAN[featureKey] ?? "growth";
        setUpgradeModal({
          open: true,
          requiredPlan: required,
          featureLabel: label,
        });
      }
    },
    [canAccess],
  );

  const closeModal = () => setUpgradeModal((s) => ({ ...s, open: false }));

  const selectPlan = (plan) => {
    setCurrentPlan(plan);
    localStorage.setItem("sf_plan", plan);
    closeModal();
  };

  return (
    <PlanContext.Provider
      value={{
        currentPlan,
        canAccess,
        requirePlan,
        upgradeModal,
        closeModal,
        selectPlan,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be inside <PlanProvider>");
  return ctx;
};

// ── Gold colour shared with landing page ──────────────────────────────────────
const GOLD = "#C9A84C";
const INK = "#0F0D0A";

// ── Upgrade Modal ─────────────────────────────────────────────────────────────
export const UpgradeModal = () => {
  const { upgradeModal, closeModal, selectPlan, currentPlan } = usePlan();
  const { open, requiredPlan, featureLabel } = upgradeModal;

  if (!open) return null;

  // Show the required plan + all higher plans
  const visiblePlans = PLAN_ORDER.filter(
    (p) => PLAN_ORDER.indexOf(p) >= PLAN_ORDER.indexOf(requiredPlan),
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "'Barlow', sans-serif",
      }}
      onClick={closeModal}
    >
      <div
        style={{
          background: INK,
          borderRadius: 20,
          border: `1px solid rgba(201,168,76,0.25)`,
          maxWidth: 860,
          width: "100%",
          padding: "40px 32px 36px",
          boxShadow: "0 40px 120px rgba(0,0,0,0.8)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={closeModal}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(255,255,255,0.06)",
            border: "none",
            borderRadius: 8,
            color: "rgba(245,240,232,0.5)",
            width: 32,
            height: 32,
            cursor: "pointer",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: `rgba(201,168,76,0.12)`,
              border: `1px solid rgba(201,168,76,0.3)`,
              borderRadius: 99,
              padding: "4px 14px",
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: GOLD,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              🔒 Feature Locked
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(22px,3vw,34px)",
              color: "#F5F0E8",
              margin: "0 0 8px",
              letterSpacing: -0.5,
            }}
          >
            {featureLabel ? `Unlock "${featureLabel}"` : "Upgrade your plan"}
          </h2>
          <p
            style={{ color: "rgba(245,240,232,0.45)", fontSize: 14, margin: 0 }}
          >
            Choose a plan to continue. Upgrade anytime — cancel anytime.
          </p>
        </div>

        {/* Plan cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${visiblePlans.length}, 1fr)`,
            gap: 16,
          }}
        >
          {visiblePlans.map((planKey) => {
            const p = PLANS[planKey];
            const isCurrent = planKey === currentPlan;
            const isHighlight = p.highlight;

            return (
              <div
                key={planKey}
                style={{
                  borderRadius: 14,
                  padding: "24px 20px",
                  background: isHighlight
                    ? "rgba(201,168,76,0.07)"
                    : "rgba(255,255,255,0.04)",
                  border: isHighlight
                    ? `2px solid ${GOLD}`
                    : "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  boxShadow: isHighlight
                    ? `0 16px 50px rgba(201,168,76,0.15)`
                    : "none",
                  transition: "transform 0.2s",
                }}
              >
                {isHighlight && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: GOLD,
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "4px 14px",
                      borderRadius: 99,
                      letterSpacing: "0.1em",
                      whiteSpace: "nowrap",
                      boxShadow: `0 4px 12px ${GOLD}66`,
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}

                {/* Plan name */}
                <p
                  style={{
                    color: GOLD,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    margin: "0 0 6px",
                  }}
                >
                  {p.label}
                </p>

                {/* Price */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 4,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 900,
                      fontSize: 36,
                      color: "#F5F0E8",
                    }}
                  >
                    {p.price}
                  </span>
                  <span
                    style={{ color: "rgba(245,240,232,0.4)", fontSize: 13 }}
                  >
                    {p.period}
                  </span>
                </div>
                <p
                  style={{
                    color: "rgba(245,240,232,0.35)",
                    fontSize: 11,
                    margin: "0 0 18px",
                  }}
                >
                  {p.desc}
                </p>

                {/* Features */}
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 22px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {p.features.map((f, j) => (
                    <li
                      key={j}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 20 20"
                        fill={GOLD}
                        style={{ flexShrink: 0, marginTop: 2 }}
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span
                        style={{ color: "rgba(245,240,232,0.7)", fontSize: 12 }}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => selectPlan(planKey)}
                  disabled={isCurrent}
                  style={{
                    background: isCurrent
                      ? "rgba(255,255,255,0.06)"
                      : isHighlight
                        ? GOLD
                        : "rgba(255,255,255,0.1)",
                    border: "none",
                    borderRadius: 10,
                    padding: "11px 12px",
                    color: isCurrent ? "rgba(245,240,232,0.4)" : "#F5F0E8",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: isCurrent ? "default" : "pointer",
                    fontFamily: "'Barlow', sans-serif",
                    boxShadow:
                      isHighlight && !isCurrent
                        ? `0 6px 18px ${GOLD}55`
                        : "none",
                    transition: "opacity 0.2s",
                  }}
                >
                  {isCurrent ? "Current plan" : p.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p
          style={{
            textAlign: "center",
            color: "rgba(245,240,232,0.25)",
            fontSize: 11,
            margin: "20px 0 0",
          }}
        >
          Secure payment · Cancel anytime · VAT inclusive
        </p>
      </div>
    </div>
  );
};
