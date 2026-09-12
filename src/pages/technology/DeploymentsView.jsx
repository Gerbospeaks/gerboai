import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  GitBranch,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";

const STATUS_STYLES = {
  live: {
    label: "Live",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  building: {
    label: "Building",
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
  },
  queued: {
    label: "Queued",
    dot: "bg-slate-400",
    text: "text-slate-600",
    bg: "bg-slate-50",
  },
  failed: {
    label: "Failed",
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50",
  },
};

const ENVIRONMENTS = ["production", "staging", "preview"];

export default function DeploymentsView({ user }) {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    projectName: "",
    environment: "production",
    branch: "main",
    url: "",
  });
  const [busyId, setBusyId] = useState(null);

  const db = getFirestore();

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "users", user.uid, "deployments"),
        orderBy("deployedAt", "desc"),
      );
      const snap = await getDocs(q);
      setDeployments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error loading deployments:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const handleCreate = async () => {
    if (!user?.uid || !form.projectName.trim()) return;
    try {
      await addDoc(collection(db, "users", user.uid, "deployments"), {
        projectName: form.projectName.trim(),
        environment: form.environment,
        branch: form.branch.trim() || "main",
        url: form.url.trim(),
        status: "building",
        deployedAt: serverTimestamp(),
      });
      setForm({
        projectName: "",
        environment: "production",
        branch: "main",
        url: "",
      });
      setShowForm(false);
      load();
    } catch (e) {
      console.error("Error creating deployment:", e);
      alert("Failed to create deployment.");
    }
  };

  const handleRedeploy = async (dep) => {
    if (!user?.uid) return;
    setBusyId(dep.id);
    try {
      await updateDoc(doc(db, "users", user.uid, "deployments", dep.id), {
        status: "building",
        deployedAt: serverTimestamp(),
      });
      await load();
      // Deployment pipelines finish asynchronously — poll status here in real usage.
      setTimeout(async () => {
        await updateDoc(doc(db, "users", user.uid, "deployments", dep.id), {
          status: "live",
        });
        load();
      }, 2500);
    } catch (e) {
      console.error("Error redeploying:", e);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!user?.uid) return;
    if (!window.confirm("Remove this deployment record?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "deployments", id));
      load();
    } catch (e) {
      console.error("Error deleting deployment:", e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Deployments</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track and trigger deployments for your projects.
          </p>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Deployment
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500">
                Project name
              </label>
              <input
                value={form.projectName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, projectName: e.target.value }))
                }
                placeholder="e.g. client-portal"
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">
                Environment
              </label>
              <select
                value={form.environment}
                onChange={(e) =>
                  setForm((f) => ({ ...f, environment: e.target.value }))
                }
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {ENVIRONMENTS.map((env) => (
                  <option key={env} value={env}>
                    {env}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">
                Branch
              </label>
              <input
                value={form.branch}
                onChange={(e) =>
                  setForm((f) => ({ ...f, branch: e.target.value }))
                }
                placeholder="main"
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">
                URL (optional)
              </label>
              <input
                value={form.url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, url: e.target.value }))
                }
                placeholder="https://client-portal.example.com"
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setShowForm(false)}
              className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!form.projectName.trim()}
              className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Deploy
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading deployments…</span>
        </div>
      ) : deployments.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl py-14 text-center">
          <GitBranch className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">
            No deployments yet
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Deploy a project to see it tracked here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
          {deployments.map((dep) => {
            const s = STATUS_STYLES[dep.status] || STATUS_STYLES.queued;
            return (
              <div
                key={dep.id}
                className="flex items-center justify-between gap-4 px-4 py-3.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot} ${
                      dep.status === "building" ? "animate-pulse" : ""
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {dep.projectName}
                      </p>
                      <span
                        className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${s.bg} ${s.text}`}
                      >
                        {s.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {dep.environment} · {dep.branch}
                      {dep.url && (
                        <>
                          {" · "}
                          <a
                            href={dep.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-violet-600 hover:underline inline-flex items-center gap-0.5"
                          >
                            {dep.url.replace(/^https?:\/\//, "")}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleRedeploy(dep)}
                    disabled={busyId === dep.id || dep.status === "building"}
                    title="Redeploy"
                    className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors disabled:opacity-40"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${busyId === dep.id ? "animate-spin" : ""}`}
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(dep.id)}
                    title="Remove"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
