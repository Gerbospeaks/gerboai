import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { dashboards } from "../config/dashboardConfig";
import logo from "../assets/img/solidflo.png";
import slide1 from "../assets/img/slide1.avif";
import slide2 from "../assets/img/slide2.avif";
import slide3 from "../assets/img/slide3.jpg";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

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

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function Register() {
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

  // ── Read the industry the user picked on the landing page ──────────────────
  const [dashboardId, setDashboardId] = useState("");

 useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("industry");
  const pending = fromQuery || localStorage.getItem("pendingDashboardId");

  if (pending) {
    setDashboardId(pending);
    localStorage.setItem("pendingDashboardId", pending); 
  }
}, []);

  const industryInfo = dashboards.find((d) => d.id === dashboardId);

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

  /* ── Validation ── */
  const validate = () => {
    if (!name.trim()) return "Please enter your full name";
    if (!email.trim()) return "Please enter your email address";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    // Guard: industry must have been picked on the landing page
    if (!dashboardId)
      return "No industry selected. Please go back and choose your industry.";
    return null;
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const result = await register(name, email, password, dashboardId, {
  companyName:              name,          // use business name if you collect it
  industry:                 dashboardId,   // maps to INDUSTRIES id list
  location:                 "",            // they can fill in from settings later
  rate:                     "",
  about:                    "",
  createMarketplaceListing: true,          // ← creates the public card
});

      if (result.success) {
        // Clean up localStorage now that registration succeeded
        localStorage.removeItem("pendingDashboardId");
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

          {/* Heading */}
          <h1 className="text-[26px] font-bold text-[#111827] mb-1">
            Create your account
          </h1>
          <p className="text-[14px] text-[#6b7280] mb-5">
            Get started — it's free. No credit card required.
          </p>

          {/* ── Industry badge (read-only confirmation) ── */}
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
            // No industry found — nudge user back
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
                type="submit"
                disabled={isSubmitting || !dashboardId}
                className="w-full mt-2 bg-[#1655e0] hover:bg-[#1245c0] text-white font-semibold py-3 rounded-xl
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

          {/* Industry confirmation on right panel */}
          <div className="mt-4 bg-white/[0.06] border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm">
            {industryInfo ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl">{industryInfo.icon}</span>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
                    Your dashboard
                  </p>
                  <p className="text-[13px] text-white font-bold">
                    {industryInfo.name}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[12px] text-white/50 text-center leading-relaxed">
                Create a secure account in under 60 seconds.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
