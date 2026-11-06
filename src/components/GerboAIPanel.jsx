// GerboAIPanel.jsx
// Drop-in view for every industry dashboard:
//   {activeView === "gerbo-ai" && <GerboAIPanel user={user} />}
// (pass fixedHeight when the content area is not a flex column)
// The GerboAI code is lazy-loaded, so it adds nothing to the initial bundle,
// and an error boundary keeps a GerboAI problem from taking down the dashboard.
import React, { Suspense, lazy } from "react";

const GerboAIDashboard = lazy(() => import("../gerbo/GerboAIDashboard"));

class GerboErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error("GerboAI panel crashed:", error);
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-center p-6">
        <p className="text-sm font-semibold text-slate-700">
          GerboAI couldn’t be loaded.
        </p>
        <button
          onClick={() => this.setState({ failed: false })}
          className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm hover:bg-slate-700"
        >
          Try again
        </button>
      </div>
    );
  }
}

const Fallback = () => (
  <div className="h-full flex items-center justify-center text-sm text-slate-500">
    Loading GerboAI…
  </div>
);

export default function GerboAIPanel({ user, fixedHeight = false }) {
  // fixedHeight: for dashboards whose content area is not a flex column
  if (fixedHeight) {
    return (
      <div className="relative h-[calc(100vh-9rem)] min-h-[520px] mb-20 md:mb-0">
        <GerboErrorBoundary>
          <Suspense fallback={<Fallback />}>
            <GerboAIDashboard solidfloEmail={user?.email} />
          </Suspense>
        </GerboErrorBoundary>
      </div>
    );
  }
  return (
    // flex-1 + absolute child: fills the dashboard's content area exactly,
    // leaving room for the mobile bottom nav (bottom-24) that overlays it.
    <div className="flex-1 min-h-0 relative">
      <div className="absolute inset-x-2 top-2 bottom-24 md:inset-3">
        <GerboErrorBoundary>
          <Suspense fallback={<Fallback />}>
            <GerboAIDashboard solidfloEmail={user?.email} />
          </Suspense>
        </GerboErrorBoundary>
      </div>
    </div>
  );
}
