import React from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Dashboard } from "./components/Dashboard";
import { GerboSignIn } from "./GerboSignIn";
// Imported AFTER Dashboard so these host rules win over the scoped dashboard CSS.
import "./styles/gerbo-embed.css";

const Loading: React.FC = () => (
  <div className="gerbo-embed-center">
    <div className="gerbo-embed-spinner" />
    <span>Loading GerboAI…</span>
  </div>
);

const Gate: React.FC<{ email?: string | null }> = ({ email }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <GerboSignIn defaultEmail={email} />;
  return <Dashboard />;
};

interface Props {
  /** The signed-in GerboAI user's email, used only to pre-fill GerboAI sign-in. */
  solidfloEmail?: string | null;
}

/**
 * GerboAI dashboard, embeddable inside any GerboAI industry dashboard.
 * Loaded lazily via src/components/GerboAIPanel.jsx.
 */
const GerboAIDashboard: React.FC<Props> = ({ solidfloEmail }) => (
  <div className="gerbo-embed">
    <AuthProvider>
      <Gate email={solidfloEmail} />
    </AuthProvider>
  </div>
);

export default GerboAIDashboard;
