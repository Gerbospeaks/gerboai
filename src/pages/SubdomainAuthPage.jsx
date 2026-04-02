import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useSubdomain } from "../hooks/useSubdomain";
import { getIndustryConfig } from "../config/industryConfig";

export default function SubdomainAuthPage() {
  const { subdomain } = useSubdomain();
  const config = getIndustryConfig(subdomain);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  const initialMode = location.pathname.includes("register")
    ? "register"
    : "login";
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (mode === "login" || mode === "register") {
      navigate(mode === "register" ? "/register" : "/login", { replace: true });
    }
  }, [mode]);

  function set(key, val) {
    setForm((p) => ({ ...p, [key]: val }));
    setError("");
  }

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

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (form.password !== form.confirm)
      return setError("Passwords do not match.");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");
    setLoading(true);
    setError("");
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password,
      );
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: form.email,
        displayName: form.name,
        dashboardId: subdomain || "general",
        createdAt: serverTimestamp(),
        plan: "free",
      });
      navigate("/dashboard");
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (!form.email) return setError("Enter your email address first.");
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, form.email);
      setResetSent(true);
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  const inp =
    "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white text-gray-800 placeholder-gray-400 transition-shadow";

  return (
    <div className="min-h-screen flex" style={{ background: "#f3f4f6" }}>
      {/* Left branding panel */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: config.color }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(${config.accent}33 1px,transparent 1px),linear-gradient(90deg,${config.accent}33 1px,transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ background: config.accent }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <span className="text-3xl">{config.icon}</span>
            <div>
              <p className="text-white font-extrabold text-lg leading-none">
                SolidFlo
              </p>
              <p className="text-white/40 text-xs mt-0.5">
                {config.label} Edition
              </p>
            </div>
          </div>
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-4">
            {config.headline}
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm">
            {config.subheadline}
          </p>
        </div>
        <div className="relative space-y-3">
          {config.features.slice(0, 4).map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${config.accent}33` }}
              >
                <svg
                  className="w-3 h-3"
                  style={{ color: config.accent }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-white/60 text-sm">{f.title}</span>
            </div>
          ))}
          <p className="text-white/20 text-xs pt-4">
            © {new Date().getFullYear()} SolidFlo
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-5 sm:p-8">
        <div className="flex items-center gap-2 mb-6 lg:hidden self-start">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <p className="font-extrabold text-gray-800 text-sm">SolidFlo</p>
            <p className="text-xs text-gray-400">{config.label} Edition</p>
          </div>
        </div>

        <div className="w-full max-w-md">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-6 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Back to {config.label} home
          </button>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7 sm:p-8">
            {/* LOGIN */}
            {mode === "login" && (
              <>
                <h2 className="text-xl font-extrabold text-gray-900 mb-0.5">
                  Welcome back
                </h2>
                <p className="text-xs text-gray-400 mb-6">
                  Sign in to your {config.label} dashboard
                </p>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={inp}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-600">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("reset");
                          setError("");
                        }}
                        className="text-xs font-semibold hover:underline"
                        style={{ color: config.accent }}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      className={inp}
                    />
                  </div>
                  {error && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                    style={{ background: config.accent }}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </form>
                <p className="text-center text-xs text-gray-400 mt-5">
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("register");
                      setError("");
                    }}
                    className="font-bold hover:underline"
                    style={{ color: config.accent }}
                  >
                    Create one free
                  </button>
                </p>
              </>
            )}

            {/* REGISTER */}
            {mode === "register" && (
              <>
                <h2 className="text-xl font-extrabold text-gray-900 mb-0.5">
                  Create your account
                </h2>
                <p className="text-xs text-gray-400 mb-6">
                  Get started with SolidFlo {config.label} — free
                </p>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                      Full name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="John Smith"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      className={inp}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={inp}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Min 6 chars"
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                        Confirm
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Repeat"
                        value={form.confirm}
                        onChange={(e) => set("confirm", e.target.value)}
                        className={inp}
                      />
                    </div>
                  </div>
                  {error && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                    style={{ background: config.accent }}
                  >
                    {loading
                      ? "Creating account..."
                      : "Create Account — It's Free"}
                  </button>
                  <p className="text-center text-xs text-gray-300">
                    By signing up you agree to our Terms of Service
                  </p>
                </form>
                <p className="text-center text-xs text-gray-400 mt-4">
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("login");
                      setError("");
                    }}
                    className="font-bold hover:underline"
                    style={{ color: config.accent }}
                  >
                    Sign in
                  </button>
                </p>
              </>
            )}

            {/* RESET */}
            {mode === "reset" && (
              <>
                <h2 className="text-xl font-extrabold text-gray-900 mb-0.5">
                  Reset your password
                </h2>
                <p className="text-xs text-gray-400 mb-6">
                  Enter your email and we'll send a reset link.
                </p>
                {resetSent ? (
                  <div className="text-center space-y-3 py-4">
                    <div className="text-4xl">📬</div>
                    <p className="text-sm font-bold text-gray-700">
                      Check your inbox
                    </p>
                    <p className="text-xs text-gray-400">
                      A reset link was sent to <strong>{form.email}</strong>.
                    </p>
                    <button
                      onClick={() => {
                        setMode("login");
                        setResetSent(false);
                      }}
                      className="text-xs font-bold hover:underline"
                      style={{ color: config.accent }}
                    >
                      ← Back to sign in
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleReset} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                        Email address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        className={inp}
                      />
                    </div>
                    {error && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                        {error}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                      style={{ background: config.accent }}
                    >
                      {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setError("");
                      }}
                      className="w-full text-xs text-gray-400 hover:text-gray-600 text-center"
                    >
                      ← Back to sign in
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
