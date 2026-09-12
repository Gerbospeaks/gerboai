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
  Database,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const DB_TYPES = ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Firestore"];
const REGIONS = [
  "us-east-1",
  "us-west-2",
  "eu-west-1",
  "af-south-1",
  "ap-southeast-1",
];

const STATUS_STYLES = {
  connected: {
    label: "Connected",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    icon: CheckCircle2,
  },
  error: {
    label: "Connection error",
    text: "text-red-700",
    bg: "bg-red-50",
    icon: XCircle,
  },
  connecting: {
    label: "Connecting",
    text: "text-amber-700",
    bg: "bg-amber-50",
    icon: RefreshCw,
  },
};

const maskConnectionString = (name, type, region) => {
  const proto =
    {
      PostgreSQL: "postgres",
      MySQL: "mysql",
      MongoDB: "mongodb",
      Redis: "redis",
      Firestore: "firestore",
    }[type] || "db";
  return `${proto}://${name.toLowerCase().replace(/\s+/g, "-")}:••••••••@${region}.db.internal:5432`;
};

export default function DatabasesView({ user }) {
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "PostgreSQL",
    region: "us-east-1",
  });
  const [busyId, setBusyId] = useState(null);
  const [revealedId, setRevealedId] = useState(null);

  const db = getFirestore();

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "users", user.uid, "databases"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      setDatabases(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error loading databases:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const handleCreate = async () => {
    if (!user?.uid || !form.name.trim()) return;
    try {
      await addDoc(collection(db, "users", user.uid, "databases"), {
        name: form.name.trim(),
        type: form.type,
        region: form.region,
        connectionString: maskConnectionString(
          form.name.trim(),
          form.type,
          form.region,
        ),
        status: "connected",
        createdAt: serverTimestamp(),
      });
      setForm({ name: "", type: "PostgreSQL", region: "us-east-1" });
      setShowForm(false);
      load();
    } catch (e) {
      console.error("Error creating database:", e);
      alert("Failed to create database.");
    }
  };

  const handleTestConnection = async (database) => {
    setBusyId(database.id);
    await updateDoc(doc(db, "users", user.uid, "databases", database.id), {
      status: "connecting",
    });
    await load();
    setTimeout(async () => {
      await updateDoc(doc(db, "users", user.uid, "databases", database.id), {
        status: "connected",
      });
      await load();
      setBusyId(null);
    }, 1400);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this database connection?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "databases", id));
      load();
    } catch (e) {
      console.error("Error deleting database:", e);
    }
  };

  const copyConnectionString = (str) => {
    navigator.clipboard?.writeText(str);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Databases</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Connections your projects use to read and write data.
          </p>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Database
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500">Name</label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. production-db"
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Type</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {DB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">
                Region
              </label>
              <select
                value={form.region}
                onChange={(e) =>
                  setForm((f) => ({ ...f, region: e.target.value }))
                }
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
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
              disabled={!form.name.trim()}
              className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading databases…</span>
        </div>
      ) : databases.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl py-14 text-center">
          <Database className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">
            No databases connected
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Create a database to get a connection string.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {databases.map((database) => {
            const s = STATUS_STYLES[database.status] || STATUS_STYLES.connected;
            const StatusIcon = s.icon;
            const revealed = revealedId === database.id;
            return (
              <div
                key={database.id}
                className="bg-white border border-slate-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                      <Database className="w-4 h-4 text-violet-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {database.name}
                        </p>
                        <span
                          className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 ${s.bg} ${s.text}`}
                        >
                          <StatusIcon
                            className={`w-2.5 h-2.5 ${database.status === "connecting" ? "animate-spin" : ""}`}
                          />
                          {s.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {database.type} · {database.region}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleTestConnection(database)}
                      disabled={busyId === database.id}
                      className="px-2.5 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50 rounded-lg transition-colors disabled:opacity-40"
                    >
                      Test connection
                    </button>
                    <button
                      onClick={() => handleDelete(database.id)}
                      title="Remove"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <code className="flex-1 text-xs font-mono text-slate-600 truncate">
                    {revealed
                      ? database.connectionString
                      : database.connectionString.replace(
                          /:[^:@]+@/,
                          ":••••••••@",
                        )}
                  </code>
                  <button
                    onClick={() => setRevealedId(revealed ? null : database.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-md transition-colors flex-shrink-0"
                    title={revealed ? "Hide" : "Reveal"}
                  >
                    {revealed ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      copyConnectionString(database.connectionString)
                    }
                    className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-white rounded-md transition-colors flex-shrink-0"
                    title="Copy"
                  >
                    <Copy className="w-3.5 h-3.5" />
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
