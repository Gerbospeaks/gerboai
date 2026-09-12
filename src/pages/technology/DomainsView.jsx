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
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  Copy,
  Loader2,
} from "lucide-react";

const DOMAIN_REGEX = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})+$/;

const STATUS_STYLES = {
  verified: {
    label: "Verified",
    icon: CheckCircle2,
    text: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    text: "text-amber-700",
    bg: "bg-amber-50",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    text: "text-red-700",
    bg: "bg-red-50",
  },
};

export default function DomainsView({ user, businessInfo }) {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const db = getFirestore();

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "users", user.uid, "domains"),
        orderBy("addedAt", "desc"),
      );
      const snap = await getDocs(q);
      setDomains(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error loading domains:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const handleAdd = async () => {
    const clean = domainInput
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    if (!DOMAIN_REGEX.test(clean)) {
      setError("Enter a valid domain, e.g. app.yourbusiness.com");
      return;
    }
    if (domains.some((d) => d.domain === clean)) {
      setError("That domain is already connected.");
      return;
    }
    setError("");
    try {
      await addDoc(collection(db, "users", user.uid, "domains"), {
        domain: clean,
        status: "pending",
        addedAt: serverTimestamp(),
      });
      setDomainInput("");
      setShowForm(false);
      load();
    } catch (e) {
      console.error("Error adding domain:", e);
      alert("Failed to add domain.");
    }
  };

  const handleVerify = async (d) => {
    setBusyId(d.id);
    try {
      // In production this would check actual DNS records for the domain.
      setTimeout(async () => {
        await updateDoc(doc(db, "users", user.uid, "domains", d.id), {
          status: "verified",
        });
        await load();
        setBusyId(null);
      }, 1600);
    } catch (e) {
      console.error("Error verifying domain:", e);
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Disconnect this domain?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "domains", id));
      load();
    } catch (e) {
      console.error("Error deleting domain:", e);
    }
  };

  const copyValue = (value) => {
    navigator.clipboard?.writeText(value);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Domains</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Connect a custom domain to{" "}
            {businessInfo?.businessName || "your workspace"}.
          </p>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Domain
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <label className="text-xs font-medium text-slate-500">Domain</label>
          <div className="flex items-center gap-2">
            <input
              value={domainInput}
              onChange={(e) => {
                setDomainInput(e.target.value);
                setError("");
              }}
              placeholder="app.yourbusiness.com"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              onClick={handleAdd}
              disabled={!domainInput.trim()}
              className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Connect
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading domains…</span>
        </div>
      ) : domains.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl py-14 text-center">
          <Globe className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">
            No domains connected
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Add a domain to point it at your project.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
          {domains.map((d) => {
            const s = STATUS_STYLES[d.status] || STATUS_STYLES.pending;
            const StatusIcon = s.icon;
            const isOpen = expandedId === d.id;
            return (
              <div key={d.id}>
                <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusIcon className={`w-4 h-4 flex-shrink-0 ${s.text}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {d.domain}
                      </p>
                      <span
                        className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${s.bg} ${s.text}`}
                      >
                        {s.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {d.status !== "verified" && (
                      <button
                        onClick={() => handleVerify(d)}
                        disabled={busyId === d.id}
                        className="px-2.5 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        {busyId === d.id ? "Checking…" : "Verify"}
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedId(isOpen ? null : d.id)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      title="Disconnect"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-4 pb-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-semibold text-slate-600">
                        Add these DNS records at your domain registrar
                      </p>
                      {[
                        {
                          type: "CNAME",
                          host: d.domain.split(".")[0],
                          value: "app.solidflo.co",
                        },
                        {
                          type: "TXT",
                          host: `_verify.${d.domain}`,
                          value: `solidflo-verify=${d.id.slice(0, 12)}`,
                        },
                      ].map((rec) => (
                        <div
                          key={rec.type}
                          className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-md px-3 py-2"
                        >
                          <div className="min-w-0 text-xs">
                            <span className="font-mono font-semibold text-slate-700">
                              {rec.type}
                            </span>
                            <span className="text-slate-400 mx-1.5">·</span>
                            <span className="font-mono text-slate-500 truncate">
                              {rec.host}
                            </span>
                            <span className="text-slate-400 mx-1.5">→</span>
                            <span className="font-mono text-slate-500 truncate">
                              {rec.value}
                            </span>
                          </div>
                          <button
                            onClick={() => copyValue(rec.value)}
                            className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-md transition-colors flex-shrink-0"
                            title="Copy value"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <p className="text-[11px] text-slate-400 pt-1">
                        DNS changes can take up to 24 hours to propagate. Click
                        Verify once you've added the records.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
