import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/img/solidflo.png";
import slide1 from "../assets/img/slide1.avif";
import slide2 from "../assets/img/slide2.avif";
import slide3 from "../assets/img/slide3.jpg";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

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

export default function Login() {
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
    const t = setInterval(
      () => setCurrentSlide((p) => (p + 1) % slides.length),
      4000,
    );
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
    const result = await login(email, password);
    setIsSubmitting(false);
    if (result.success) {
      navigate(result.isAdmin ? "/admin" : "/home");
    } else {
      setError(result.message);
    }
  };

  return (
    <div
      className="min-h-screen flex bg-[#f8f9fc]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[52%] flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col px-8 py-8 max-w-[480px] mx-auto w-full justify-center">
          {/* Logo */}
          <div className="mb-10">
            <img src={logo} alt="logo" className="h-9 object-contain" />
          </div>

          {/* Heading */}
          <h1 className="text-[28px] font-bold text-[#111827] mb-1">
            Welcome back
          </h1>
          <p className="text-[14px] text-[#6b7280] mb-8">
            Sign in to your account to continue
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              <span className="mt-0.5">⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-[#374151]">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-white border border-[#d1d5db] text-[#111827] rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1655e0]/30 focus:border-[#1655e0]
                  disabled:bg-[#f9fafb] disabled:text-[#9ca3af] placeholder:text-[#c0c4ce] transition-all"
              />
            </div>

            {/* Password */}
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
                  className="w-full px-4 py-3 pr-11 bg-white border border-[#d1d5db] text-[#111827] rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#1655e0]/30 focus:border-[#1655e0]
                    disabled:bg-[#f9fafb] disabled:text-[#9ca3af] placeholder:text-[#c0c4ce] transition-all"
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

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                  ${rememberMe ? "bg-[#1655e0] border-[#1655e0]" : "bg-white border-[#d1d5db] group-hover:border-[#1655e0]"}`}
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-1 bg-[#1655e0] hover:bg-[#1245c0] text-white font-semibold py-3 rounded-xl
                transition-all duration-200 flex items-center justify-center gap-2 text-sm
                shadow-md shadow-[#1655e0]/20 disabled:bg-[#a0aec0] disabled:cursor-not-allowed disabled:shadow-none"
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

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#e8eaf0]" />
            <span className="text-[12px] text-[#9ca3af]">or</span>
            <div className="flex-1 h-px bg-[#e8eaf0]" />
          </div>

          {/* SSO hint (non-functional, visual only) */}
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
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#d1d5db]
                  rounded-lg text-[12px] font-medium text-[#374151] hover:bg-[#f9fafb] hover:border-[#b0b8c8]
                  transition-all duration-200"
              >
                {icon}
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>

          {/* Footer */}
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

      {/* ── RIGHT PANEL (identical to Register) ────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[48%] bg-[#0f1c3f] relative overflow-hidden items-center justify-center p-10">
        {/* Background decoration */}
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
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                    i === currentSlide
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-105"
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1c3f]/60 to-transparent" />
            </div>

            <div className="px-8 py-7">
              <div className="relative" style={{ minHeight: "80px" }}>
                {slides.map((slide, i) => (
                  <div
                    key={i}
                    className={`transition-all duration-500 ${
                      i === currentSlide
                        ? "opacity-100 translate-y-0 relative"
                        : "opacity-0 absolute top-0 translate-y-2 pointer-events-none"
                    }`}
                  >
                    <h3 className="text-[20px] font-bold text-white mb-2">
                      {slide.title}
                    </h3>
                    <p className="text-[14px] text-white/60 leading-relaxed">
                      {slide.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === currentSlide
                        ? "w-6 h-2 bg-[#1655e0]"
                        : "w-2 h-2 bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Stats row */}
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
        </div>
      </div>
    </div>
  );
}
