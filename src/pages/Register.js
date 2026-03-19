import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { dashboards } from "../config/dashboardConfig";
import logo from "../assets/img/solidflo.png";
import slide1 from "../assets/img/slide1.avif";
import slide2 from "../assets/img/slide2.avif";
import slide3 from "../assets/img/slide3.jpg";
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

/* ─── Slide data ─────────────────────────────────────────────────────────── */
const slides = [
  {
    image: slide1,
    title: "Seamless work experience",
    description: "Everything you need in an easily customizable dashboard",
  },
  {
    image: slide2,
    title: "Boost your productivity",
    description: "Streamline your workflow with powerful tools",
  },
  {
    image: slide3,
    title: "Collaborate effortlessly",
    description: "Work together with your team in real-time",
  },
];

/* ─── Pricing plans ──────────────────────────────────────────────────────── */
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    period: "forever free",
    icon: <Shield className="w-4 h-4" />,
    color: "#6b7280",
    features: [
      "Up to 5 clients",
      "Unlimited invoices",
      "AI assistant (basic)",
      "Email support",
      "Mobile app access",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: 6,
    period: "per month",
    icon: <Zap className="w-4 h-4" />,
    color: "#1655e0",
    features: [
      "Unlimited clients",
      "AI assistant (full)",
      "Recurring billing",
      "Custom branding",
      "Priority support",
      "Analytics & reports",
      "API access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 25,
    period: "per month",
    icon: <Users className="w-4 h-4" />,
    color: "#0f766e",
    features: [
      "Everything in Pro",
      "Multi-user access",
      "White-label option",
      "Dedicated manager",
      "Custom integrations",
      "SLA guarantee",
      "Custom training",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

/* ─── Step dot ───────────────────────────────────────────────────────────── */
function StepDot({ step, current, label }) {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
        ${
          done
            ? "bg-[#1655e0] text-white"
            : active
              ? "bg-[#1655e0] text-white ring-4 ring-[#1655e0]/20"
              : "bg-[#f1f3f9] text-[#a0aec0]"
        }`}
      >
        {done ? <Check className="w-4 h-4" /> : step}
      </div>
      <span
        className={`text-[10px] font-medium whitespace-nowrap
        ${active ? "text-[#1655e0]" : "text-[#a0aec0]"}`}
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

/* ─── Industry card ──────────────────────────────────────────────────────── */
function IndustryCard({ dashboard, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative group flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-left w-full
        ${
          selected
            ? "border-[#1655e0] bg-[#f0f4ff] shadow-md"
            : "border-[#e8eaf0] bg-white hover:border-[#b8c5f0] hover:bg-[#f8f9ff] hover:shadow-sm"
        }`}
    >
      {selected && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#1655e0] rounded-full flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        </span>
      )}
      <span className="text-2xl leading-none">{dashboard.icon}</span>
      <span
        className={`text-[11px] font-semibold leading-tight text-center transition-colors
        ${selected ? "text-[#1655e0]" : "text-[#374151] group-hover:text-[#1655e0]"}`}
      >
        {dashboard.name}
      </span>
    </button>
  );
}

/* ─── Form helpers ───────────────────────────────────────────────────────── */
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

function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  disabled,
  rightElement,
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 bg-white border border-[#d1d5db] text-[#111827] rounded-lg text-sm
          focus:outline-none focus:ring-2 focus:ring-[#1655e0]/30 focus:border-[#1655e0]
          disabled:bg-[#f9fafb] disabled:text-[#9ca3af] placeholder:text-[#c0c4ce] transition-all"
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
  );
}

/* ─── Plan card ──────────────────────────────────────────────────────────── */
function PlanCard({ plan, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left rounded-2xl border-2 p-5 transition-all duration-200
        ${
          selected
            ? "border-[#1655e0] bg-[#f0f4ff] shadow-md"
            : "border-[#e8eaf0] bg-white hover:border-[#b8c5f0] hover:shadow-sm"
        }`}
    >
      {plan.popular && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1
          bg-[#1655e0] text-white text-[10px] font-bold rounded-full whitespace-nowrap tracking-wide"
        >
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

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function Register() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedDashboard, setSelectedDashboard] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [industrySearch, setIndustrySearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const { register } = useAuth();
  const navigate = useNavigate();

  /* auto-advance slides */
  useEffect(() => {
    const t = setInterval(
      () => setCurrentSlide((p) => (p + 1) % slides.length),
      4000,
    );
    return () => clearInterval(t);
  }, []);

  const filteredDashboards = dashboards.filter(
    (d) =>
      d.name.toLowerCase().includes(industrySearch.toLowerCase()) ||
      d.description.toLowerCase().includes(industrySearch.toLowerCase()),
  );
  const selectedInfo = dashboards.find((d) => d.id === selectedDashboard);

  /* ── Validation ── */
  const validateStep1 = () => {
    if (!name.trim()) return "Please enter your full name";
    if (!email.trim()) return "Please enter your email address";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  };

  /* ── Navigation ── */
  const goNext = () => {
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setError(err);
        return;
      }
    }
    if (step === 2 && !selectedDashboard) {
      setError("Please select your industry to continue");
      return;
    }
    setError("");
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setError("");
    setStep((s) => s - 1);
  };

  /* ── Submit on step 3 ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      goNext();
      return;
    }
    if (!selectedPlan) {
      setError("Please choose a plan to continue");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      // selectedDashboard is passed as the industry/route key.
      // selectedPlan is passed in the extra metadata object.
      // Your AuthContext register() should save both fields to Firestore:
      //   { dashboard: selectedDashboard, plan: selectedPlan, ... }
      const result = await register(name, email, password, selectedDashboard, {
        plan: selectedPlan,
      });
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => navigate("/login"), 5000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const STEP_LABELS = ["Account", "Industry", "Subscribe"];

  const headings = [
    {
      title: "Create your account",
      sub: "Get started — it's free. No credit card required.",
    },
    {
      title: "Choose your industry",
      sub: "We'll tailor your dashboard to match your business type.",
    },
    {
      title: "Pick your plan",
      sub: "Start free and upgrade anytime. No contracts, cancel whenever.",
    },
  ];

  const panelHint = [
    "Create a secure account in under 60 seconds.",
    `${dashboards.length}+ industry templates — your dashboard is ready the moment you sign up.`,
    "Start free, scale when you're ready. No card needed for the Starter plan.",
  ];

  return (
    <div
      className="min-h-screen flex bg-[#f8f9fc]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ══════════════════════════════════════════
          LEFT — Form panel
      ══════════════════════════════════════════ */}
      <div className="w-full lg:w-[52%] flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col px-8 py-8 max-w-[560px] mx-auto w-full">
          {/* Logo */}
          <div className="mb-8">
            <img src={logo} alt="SolidFlo" className="h-9 object-contain" />
          </div>

          {/* 3-step indicator */}
          <div className="flex items-center gap-0 mb-8">
            {STEP_LABELS.map((label, i) => (
              <React.Fragment key={label}>
                <StepDot step={i + 1} current={step} label={label} />
                {i < STEP_LABELS.length - 1 && (
                  <StepLine active={step > i + 1} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Heading */}
          <h1 className="text-[26px] font-bold text-[#111827] mb-1">
            {headings[step - 1].title}
          </h1>
          <p className="text-[14px] text-[#6b7280] mb-7">
            {headings[step - 1].sub}
          </p>

          {/* Alerts */}
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
            {/* ── STEP 1: Account ── */}
            {step === 1 && (
              <div className="space-y-4 flex-1">
                <Field label="Full Name">
                  <Input
                    placeholder="John Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                  />
                </Field>

                <Field label="Email Address">
                  <Input
                    type="email"
                    placeholder="john@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                </Field>

                <Field label="Password">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="text-[#9ca3af] hover:text-[#374151] transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                  />
                  {password && (
                    <div className="flex gap-1 mt-2">
                      {[...Array(4)].map((_, i) => {
                        const strength = Math.min(
                          Math.floor(password.length / 3),
                          4,
                        );
                        const colors = [
                          "bg-red-400",
                          "bg-orange-400",
                          "bg-yellow-400",
                          "bg-emerald-400",
                        ];
                        return (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300
                              ${i < strength ? colors[strength - 1] : "bg-[#e8eaf0]"}`}
                          />
                        );
                      })}
                    </div>
                  )}
                </Field>

                <Field label="Confirm Password">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowConfirm((p) => !p)}
                        className="text-[#9ca3af] hover:text-[#374151] transition-colors"
                      >
                        {showConfirm ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                  />
                </Field>

                <button
                  type="button"
                  onClick={goNext}
                  className="w-full mt-2 bg-[#1655e0] hover:bg-[#1245c0] text-white font-semibold py-3 rounded-xl
                    transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-md shadow-[#1655e0]/20"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ── STEP 2: Industry ── */}
            {step === 2 && (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                  <input
                    type="text"
                    placeholder="Search industry..."
                    value={industrySearch}
                    onChange={(e) => setIndustrySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#d1d5db] rounded-lg text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#1655e0]/30 focus:border-[#1655e0]
                      placeholder:text-[#c0c4ce] transition-all"
                  />
                </div>

                {selectedInfo && (
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-[#f0f4ff] border border-[#c7d5f8] rounded-lg">
                    <span className="text-base">{selectedInfo.icon}</span>
                    <span className="text-[13px] font-semibold text-[#1655e0]">
                      {selectedInfo.name}
                    </span>
                    <span className="text-[11px] text-[#6b7280] ml-1">
                      — {selectedInfo.description}
                    </span>
                  </div>
                )}

                <div
                  className="overflow-y-auto flex-1 pr-1 pb-1"
                  style={{ maxHeight: "320px" }}
                >
                  {filteredDashboards.length === 0 ? (
                    <div className="text-center py-8 text-[#9ca3af] text-sm">
                      No industries found for "{industrySearch}"
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {filteredDashboards.map((d) => (
                        <IndustryCard
                          key={d.id}
                          dashboard={d}
                          selected={selectedDashboard === d.id}
                          onClick={() => setSelectedDashboard(d.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-4 pt-3 border-t border-[#e8eaf0]">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-1.5 px-4 py-3 border border-[#d1d5db] text-[#374151]
                      rounded-xl text-sm font-semibold hover:bg-[#f9fafb] transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!selectedDashboard}
                    className="flex-1 bg-[#1655e0] hover:bg-[#1245c0] text-white font-semibold py-3 rounded-xl
                      transition-all duration-200 flex items-center justify-center gap-2 text-sm
                      shadow-md shadow-[#1655e0]/20 disabled:bg-[#a0aec0] disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {selectedDashboard ? "Continue" : "Select an Industry"}
                    {selectedDashboard && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Subscription plan ── */}
            {step === 3 && (
              <div className="flex flex-col flex-1">
                <div className="grid grid-cols-1 gap-4 mb-5">
                  {PLANS.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      selected={selectedPlan === plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                    />
                  ))}
                </div>

                {selectedPlan && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f0f4ff] border border-[#c7d5f8] rounded-xl mb-4">
                    <Check
                      className="w-4 h-4 text-[#1655e0]"
                      strokeWidth={2.5}
                    />
                    <span className="text-[13px] text-[#374151]">
                      Selected:{" "}
                      <span className="font-bold text-[#1655e0]">
                        {PLANS.find((p) => p.id === selectedPlan)?.name}
                      </span>{" "}
                      — upgrade or downgrade anytime.
                    </span>
                  </div>
                )}

                <div className="flex gap-3 pt-3 border-t border-[#e8eaf0]">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-1.5 px-4 py-3 border border-[#d1d5db] text-[#374151]
                      rounded-xl text-sm font-semibold hover:bg-[#f9fafb] transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedPlan}
                    className="flex-1 bg-[#1655e0] hover:bg-[#1245c0] text-white font-semibold py-3 rounded-xl
                      transition-all duration-200 flex items-center justify-center gap-2 text-sm
                      shadow-md shadow-[#1655e0]/20 disabled:bg-[#a0aec0] disabled:cursor-not-allowed disabled:shadow-none"
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
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-[#e8eaf0]">
            <p className="text-[12px] text-[#9ca3af] text-center mb-3">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-[#1655e0] hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-[#1655e0] hover:underline">
                Privacy Policy
              </Link>
            </p>
            <p className="text-[13px] text-[#6b7280] text-center">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#1655e0] font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT — Decorative panel
      ══════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[48%] bg-[#0f1c3f] relative overflow-hidden items-center justify-center p-10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#1655e0]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#1655e0]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#2563eb]/10 rounded-full blur-2xl" />
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.04]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-sm w-full">
          {/* Slide card */}
          <div className="bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div
              className="relative overflow-hidden"
              style={{ height: "260px" }}
            >
              {slides.map((slide, i) => (
                <img
                  key={i}
                  src={slide.image}
                  alt={slide.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out
                    ${i === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1c3f]/60 to-transparent" />
            </div>
            <div className="px-8 py-7 relative" style={{ minHeight: 130 }}>
              {slides.map((slide, i) => (
                <div
                  key={i}
                  className={`transition-all duration-500
                  ${i === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 absolute translate-y-2 pointer-events-none"}`}
                >
                  <h3 className="text-[20px] font-bold text-white mb-2">
                    {slide.title}
                  </h3>
                  <p className="text-[14px] text-white/60 leading-relaxed">
                    {slide.description}
                  </p>
                </div>
              ))}
              <div className="flex gap-2 mt-5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`rounded-full transition-all duration-300
                      ${i === currentSlide ? "w-6 h-2 bg-[#1655e0]" : "w-2 h-2 bg-white/30 hover:bg-white/50"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { value: "28+", label: "Industries" },
              { value: "10k+", label: "Businesses" },
              { value: "99.9%", label: "Uptime" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3 text-center backdrop-blur-sm"
              >
                <div className="text-[18px] font-bold text-white">
                  {s.value}
                </div>
                <div className="text-[11px] text-white/50 mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Step-aware hint */}
          <div className="mt-4 bg-white/[0.06] border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm">
            <p className="text-[12px] text-white/50 text-center leading-relaxed">
              {panelHint[step - 1]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
