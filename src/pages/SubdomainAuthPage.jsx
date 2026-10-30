import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { getDashboardRoute } from "../utils/dashboardRoutes";
import {
  sendPasswordResetEmail,
} from "firebase/auth";

import { useSubdomain } from "../hooks/useSubdomain";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ChevronLeft,
  Check,
  Search,
  Zap,
  Shield,
  Users,
} from "lucide-react";
import AuthRightPanel from "../components/AuthRightPanel";
import logo from "../assets/img/solidflo.png";
import { dashboards } from "../config/dashboardConfig";

/* ── Plans ── */
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    period: "forever free",
    icon: <Shield className="w-4 h-4" />,
    color: "#6b7280",
    popular: false,
    features: [
      "Up to 5 clients",
      "Unlimited invoices",
      "AI assistant (basic)",
      "Email support",
      "Mobile app access",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 6,
    period: "per month",
    icon: <Zap className="w-4 h-4" />,
    color: "#1655e0",
    popular: true,
    features: [
      "Unlimited clients",
      "AI assistant (full)",
      "Recurring billing",
      "Custom branding",
      "Priority support",
      "Analytics & reports",
      "API access",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 25,
    period: "per month",
    icon: <Users className="w-4 h-4" />,
    color: "#0f766e",
    popular: false,
    features: [
      "Everything in Pro",
      "Multi-user access",
      "White-label option",
      "Dedicated manager",
      "Custom integrations",
      "SLA guarantee",
      "Custom training",
    ],
  },
];

function friendlyError(code) {
  const map = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Try again.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
    "auth/invalid-credential": "Incorrect email or password.",
  };
  return map[code] || "Something went wrong. Please try again.";
}

/* ── Step indicator ── */
function StepDot({ step, current, label }) {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${done ? "bg-[#1655e0] text-white" : active ? "bg-[#1655e0] text-white ring-4 ring-[#1655e0]/20" : "bg-[#f1f3f9] text-[#a0aec0]"}`}
      >
        {done ? <Check className="w-4 h-4" /> : step}
      </div>
      <span
        className={`text-[10px] font-medium whitespace-nowrap ${active ? "text-[#1655e0]" : "text-[#a0aec0]"}`}
      >
        {label}
      </span>
    </div>
  );
}

function StepLine({ active }) {
  return (
    <div
      className="flex-1 h-[2px] mt-[-12px] rounded-full transition-all duration-500"
      style={{ background: active ? "#1655e0" : "#e8eaf0" }}
    />
  );
}

/* ── Industry card ── */
function IndustryCard({ dashboard, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative group flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-left w-full ${selected ? "border-[#1655e0] bg-[#f0f4ff] shadow-md" : "border-[#e8eaf0] bg-white hover:border-[#b8c5f0] hover:bg-[#f8f9ff] hover:shadow-sm"}`}
    >
      {selected && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#1655e0] rounded-full flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        </span>
      )}
      <span className="text-2xl leading-none">{dashboard.icon}</span>
      <span
        className={`text-[11px] font-semibold leading-tight text-center transition-colors ${selected ? "text-[#1655e0]" : "text-[#374151] group-hover:text-[#1655e0]"}`}
      >
        {dashboard.name}
      </span>
    </button>
  );
}

/* ── Plan card ── */
function PlanCard({ plan, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 ${selected ? "border-[#1655e0] bg-[#f0f4ff] shadow-md" : "border-[#e8eaf0] bg-white hover:border-[#b8c5f0] hover:shadow-sm"}`}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#1655e0] text-white text-[10px] font-bold rounded-full whitespace-nowrap tracking-wide">
          MOST POPULAR
        </span>
      )}
      {selected && (
        <span className="absolute top-3 right-3 w-5 h-5 bg-[#1655e0] rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </span>
      )}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="p-1.5 rounded-lg"
          style={{ background: `${plan.color}18`, color: plan.color }}
        >
          {plan.icon}
        </span>
        <span className="text-[14px] font-bold text-[#111827]">
          {plan.name}
        </span>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-[26px] font-extrabold text-[#111827]">
          {plan.price === 0 ? "Free" : `$${plan.price}`}
        </span>
        {plan.price > 0 && (
          <span className="text-[12px] text-[#9ca3af]">/ {plan.period}</span>
        )}
      </div>
      {plan.price === 0 && (
        <p className="text-[11px] text-[#9ca3af] mb-1">{plan.period}</p>
      )}
      <div className="border-t border-[#f0f0f0] my-3" />
      <ul className="space-y-1.5">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check
              className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
              style={{ color: selected ? "#1655e0" : "#22c55e" }}
              strokeWidth={2.5}
            />
            <span className="text-[12px] text-[#6b7280]">{f}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

/* ── Input helpers ── */
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-semibold text-[#374151]">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 bg-white border border-[#d1d5db] text-[#111827] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1655e0]/30 focus:border-[#1655e0] disabled:bg-[#f9fafb] disabled:text-[#9ca3af] placeholder:text-[#c0c4ce] transition-all";

/* ══════════════════════════════════════════════════════════
   LOGIN
══════════════════════════════════════════════════════════ */
function LoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide((p) => (p + 1) % 3), 4000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  if (!email || !password) {
    setError("Please fill in all fields");
    return;
  }
  setIsSubmitting(true);
  try {
    const result = await login(email, password);

   if (result.success) {
  navigate(
    result.isAdmin ? "/admin" : getDashboardRoute(result.dashboardId),
    { replace: true },
  );
}else {
      setError(result.message);
    }
  } catch (err) {
    setError("Something went wrong. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div
      className="min-h-screen flex bg-[#f8f9fc]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="w-full lg:w-[52%] flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col px-8 py-8 max-w-[480px] mx-auto w-full justify-center">
          <div className="mb-10">
            <img src={logo} alt="SolidFlo" className="h-9 object-contain" />
          </div>
          <h1 className="text-[28px] font-bold text-[#111827] mb-1">
            Welcome back
          </h1>
          <p className="text-[14px] text-[#6b7280] mb-8">
            Sign in to your account to continue
          </p>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              <span className="mt-0.5">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email Address">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                disabled={isSubmitting}
                className={inputCls}
              />
            </Field>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[13px] font-semibold text-[#374151]">
                  Password
                </label>
                <Link
                  to="/auth-action"
                  className="text-[12px] text-[#1655e0] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${rememberMe ? "bg-[#1655e0] border-[#1655e0]" : "bg-white border-[#d1d5db] group-hover:border-[#1655e0]"}`}
                >
                  {rememberMe && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      viewBox="0 0 10 10"
                      fill="none"
                    >
                      <path
                        d="M2 5l2.5 2.5L8 3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-[13px] text-[#374151]">
                Remember me for 30 days
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-1 bg-[#1655e0] hover:bg-[#1245c0] text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-md shadow-[#1655e0]/20 disabled:bg-[#a0aec0] disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Signing in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#e8eaf0]" />
            <span className="text-[12px] text-[#9ca3af]">or</span>
            <div className="flex-1 h-px bg-[#e8eaf0]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Continue with Google",
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                ),
              },
              {
                label: "Continue with Microsoft",
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                ),
              },
            ].map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#d1d5db] rounded-lg text-[12px] font-medium text-[#374151] hover:bg-[#f9fafb] hover:border-[#b0b8c8] transition-all duration-200"
              >
                {icon}
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-5 border-t border-[#e8eaf0]">
            <p className="text-[12px] text-[#9ca3af] text-center mb-3">
              Protected by reCAPTCHA —{" "}
              <Link to="/privacy" className="text-[#1655e0] hover:underline">
                Privacy
              </Link>{" "}
              &{" "}
              <Link to="/terms" className="text-[#1655e0] hover:underline">
                Terms
              </Link>
            </p>
            <p className="text-[13px] text-[#6b7280] text-center">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#1655e0] font-semibold hover:underline"
              >
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
      <AuthRightPanel
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   REGISTER
══════════════════════════════════════════════════════════ */


const STEP_LABELS = ["Account", "Industry", "Subscribe"];
const panelHint = [
  "Create a secure account in under 60 seconds.",
  `${dashboards?.length ?? 28}+ industry templates — your dashboard is ready the moment you sign up.`,
  "Start free, scale when you're ready. No card needed for the Starter plan.",
];

function RegisterView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dashboardId, setDashboardId] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
  // 1. Try URL param first (production: came from main domain redirect)
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("industry");

  // 2. Fall back to localStorage (dev mode or same-origin flow)
  const fromStorage = localStorage.getItem("pendingDashboardId");

  const resolved = fromUrl || fromStorage;
  if (resolved) {
    setDashboardId(resolved);
    // Persist it locally so page refreshes don't lose it
    localStorage.setItem("pendingDashboardId", resolved);
  }
}, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide((p) => (p + 1) % 3), 4000);
    return () => clearInterval(t);
  }, []);

  const industryInfo = (dashboards || []).find((d) => d.id === dashboardId);

  const validate = () => {
    if (!name.trim()) return "Please enter your full name";
    if (!email.trim()) return "Please enter your email address";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    if (!dashboardId)
      return "No industry selected. Please go back and choose your industry.";
    return null;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const err = validate();
  if (err) { setError(err); return; }

  setError("");
  setIsSubmitting(true);
  try {
    const result = await register(name, email, password, dashboardId, {
      companyName: name,
      industry: dashboardId,
    });

    if (result.success) {
      localStorage.removeItem("pendingDashboardId");
      setSuccess(result.message); // AuthContext already returns the right message
    } else {
      setError(result.message);
    }
  } catch (err) {
    setError("Something went wrong. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div
      className="min-h-screen flex bg-[#f8f9fc]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="w-full lg:w-[52%] flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col px-8 py-8 max-w-[560px] mx-auto w-full">
          <div className="mb-8">
            <img src={logo} alt="SolidFlo" className="h-9 object-contain" />
          </div>

          <h1 className="text-[26px] font-bold text-[#111827] mb-1">
            Create your account
          </h1>
          <p className="text-[14px] text-[#6b7280] mb-5">
            Get started — it's free. No credit card required.
          </p>

          {/* Industry badge */}
          {industryInfo ? (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f0f4ff] border border-[#c7d5f8] rounded-xl mb-6">
              <span className="text-xl">{industryInfo.icon}</span>
              <div>
                <p className="text-[12px] text-[#6b7280]">Selected industry</p>
                <p className="text-[13px] font-bold text-[#1655e0]">
                  {industryInfo.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="ml-auto text-[11px] text-[#1655e0] font-semibold hover:underline"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl mb-6">
              <span>⚠️</span>
              <p className="text-[12px] text-amber-700 flex-1">
                No industry selected.{" "}
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="font-semibold underline"
                >
                  Go back
                </button>{" "}
                to choose one.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
              <span className="mt-0.5">⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-5 text-sm">
              <span className="mt-0.5">✅</span> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col flex-1">
            <div className="space-y-4 flex-1">
              <Field label="Full Name">
                <input
                  type="text"
                  placeholder="John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className={inputCls}
                />
              </Field>

              <Field label="Email Address">
                <input
                  type="email"
                  placeholder="john@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className={inputCls}
                />
              </Field>

              <Field label="Password">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className={`${inputCls} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="flex gap-1 mt-2">
                    {[...Array(4)].map((_, i) => {
                      const strength = Math.min(Math.floor(password.length / 3), 4);
                      const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-400"];
                      return (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? colors[strength - 1] : "bg-[#e8eaf0]"}`}
                        />
                      );
                    })}
                  </div>
                )}
              </Field>

              <Field label="Confirm Password">
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    className={`${inputCls} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              <button
                type="submit"
                disabled={isSubmitting || !dashboardId}
                className="w-full mt-2 bg-[#1655e0] hover:bg-[#1245c0] text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-md shadow-[#1655e0]/20 disabled:bg-[#a0aec0] disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-[#e8eaf0]">
            <p className="text-[12px] text-[#9ca3af] text-center mb-3">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-[#1655e0] hover:underline">Terms</Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-[#1655e0] hover:underline">Privacy Policy</Link>
            </p>
            <p className="text-[13px] text-[#6b7280] text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-[#1655e0] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <AuthRightPanel currentSlide={currentSlide} setCurrentSlide={setCurrentSlide} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DEFAULT EXPORT — route based
══════════════════════════════════════════════════════════ */
export default function SubdomainAuthPage() {
  const location = useLocation();
  if (location.pathname.includes("register")) return <RegisterView />;
  return <LoginView />;
}
