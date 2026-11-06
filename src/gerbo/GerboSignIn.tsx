import React, { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import logo from "./images/gerbo-logo.png";

const APP_URL = (
  process.env.REACT_APP_GERBO_APP_URL || "https://app.gerbo.ai"
).replace(/\/$/, "");

interface Props {
  /** Pre-fills the email with the GerboAI user's address (still editable). */
  defaultEmail?: string | null;
}

/**
 * GerboAI has its own accounts (separate Firebase project), so a GerboAI user
 * signs in to GerboAI once here. Firebase persists the session, so this only
 * shows on first use (or after "Sign out" inside the GerboAI panel).
 */
export const GerboSignIn: React.FC<Props> = ({ defaultEmail }) => {
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState(defaultEmail || "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    const result = await signIn(email.trim(), password);
    if (!result.success) setError(result.message || "Sign in failed.");
    setBusy(false); // on success the auth listener swaps this screen for the dashboard
  };

  const forgot = async () => {
    setError("");
    setInfo("");
    if (!email.trim()) {
      setError("Enter your email first, then choose “Forgot password”.");
      return;
    }
    const result = await resetPassword(email.trim());
    if (result.success) setInfo(result.message || "Password reset email sent.");
    else setError(result.message || "Could not send reset email.");
  };

  return (
    <div className="gerbo-signin-wrap">
      <form className="gerbo-signin-card" onSubmit={submit}>
        <img className="gerbo-signin-logo" src={logo} alt="GerboAI" />
        <h2>Sign in to GerboAI</h2>
        <p className="gerbo-signin-sub">
          Your AI call assistant has its own account. Sign in once to manage
          calls, voicemails and your agent from here.
        </p>

        {error && <div className="gerbo-signin-msg err">{error}</div>}
        {info && <div className="gerbo-signin-msg ok">{info}</div>}

        <div className="gerbo-signin-field">
          <label htmlFor="gerbo-email">Email</label>
          <input
            id="gerbo-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="gerbo-signin-field">
          <label htmlFor="gerbo-password">Password</label>
          <input
            id="gerbo-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="gerbo-signin-btn" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <div className="gerbo-signin-links">
          <button type="button" onClick={forgot}>
            Forgot password?
          </button>
          <a href={`${APP_URL}/register`} target="_blank" rel="noopener noreferrer">
            Create a GerboAI account
          </a>
        </div>
      </form>
    </div>
  );
};
