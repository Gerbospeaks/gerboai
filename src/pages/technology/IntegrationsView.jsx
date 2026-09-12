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
  Webhook,
  Plus,
  Trash2,
  Loader2,
  Github,
  MessageSquare,
  CreditCard,
  Zap,
  Link2,
} from "lucide-react";

const CATALOG = [
  {
    key: "github",
    name: "GitHub",
    description: "Sync repositories and trigger deployments on push.",
    icon: Github,
  },
  {
    key: "slack",
    name: "Slack",
    description: "Send deployment and billing alerts to a channel.",
    icon: MessageSquare,
  },
  {
    key: "stripe",
    name: "Stripe",
    description: "Sync invoice payments and subscription status.",
    icon: CreditCard,
  },
  {
    key: "zapier",
    name: "Zapier",
    description: "Connect this workspace to thousands of other apps.",
    icon: Zap,
  },
];

export default function IntegrationsView({ user }) {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState(null);
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [webhookForm, setWebhookForm] = useState({ name: "", url: "" });

  const db = getFirestore();

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "users", user.uid, "integrations"),
        orderBy("connectedAt", "desc"),
      );
      const snap = await getDocs(q);
      setIntegrations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error loading integrations:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const connectedKeys = new Set(
    integrations.filter((i) => i.type !== "webhook").map((i) => i.catalogKey),
  );

  const handleConnect = async (item) => {
    if (!user?.uid) return;
    setBusyKey(item.key);
    try {
      await addDoc(collection(db, "users", user.uid, "integrations"), {
        catalogKey: item.key,
        name: item.name,
        type: "catalog",
        enabled: true,
        connectedAt: serverTimestamp(),
      });
      await load();
    } catch (e) {
      console.error("Error connecting integration:", e);
      alert("Failed to connect.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleAddWebhook = async () => {
    if (!user?.uid || !webhookForm.name.trim() || !webhookForm.url.trim())
      return;
    try {
      await addDoc(collection(db, "users", user.uid, "integrations"), {
        name: webhookForm.name.trim(),
        type: "webhook",
        url: webhookForm.url.trim(),
        enabled: true,
        connectedAt: serverTimestamp(),
      });
      setWebhookForm({ name: "", url: "" });
      setShowWebhookForm(false);
      load();
    } catch (e) {
      console.error("Error adding webhook:", e);
      alert("Failed to add webhook.");
    }
  };

  const handleToggle = async (integration) => {
    try {
      await updateDoc(
        doc(db, "users", user.uid, "integrations", integration.id),
        {
          enabled: !integration.enabled,
        },
      );
      load();
    } catch (e) {
      console.error("Error toggling integration:", e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this integration?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "integrations", id));
      load();
    } catch (e) {
      console.error("Error deleting integration:", e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Integrations</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Connect the tools you already use, or send events to a custom
            webhook.
          </p>
        </div>
        <button
          onClick={() => setShowWebhookForm((p) => !p)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Custom Webhook
        </button>
      </div>

      {showWebhookForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500">Name</label>
              <input
                value={webhookForm.name}
                onChange={(e) =>
                  setWebhookForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Ops alerts"
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">
                Endpoint URL
              </label>
              <input
                value={webhookForm.url}
                onChange={(e) =>
                  setWebhookForm((f) => ({ ...f, url: e.target.value }))
                }
                placeholder="https://hooks.example.com/..."
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setShowWebhookForm(false)}
              className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddWebhook}
              disabled={!webhookForm.name.trim() || !webhookForm.url.trim()}
              className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Add Webhook
            </button>
          </div>
        </div>
      )}

      {/* Catalog */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Available</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATALOG.map((item) => {
            const Icon = item.icon;
            const connected = connectedKeys.has(item.key);
            return (
              <div
                key={item.key}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-slate-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.description}
                  </p>
                  <button
                    onClick={() => handleConnect(item)}
                    disabled={connected || busyKey === item.key}
                    className={`mt-2.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                      connected
                        ? "bg-emerald-50 text-emerald-700 cursor-default"
                        : "bg-violet-50 text-violet-700 hover:bg-violet-100 disabled:opacity-50"
                    }`}
                  >
                    {connected
                      ? "Connected"
                      : busyKey === item.key
                        ? "Connecting…"
                        : "Connect"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connected + webhooks */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Connected</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading integrations…</span>
          </div>
        ) : integrations.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl py-12 text-center">
            <Link2 className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">
              Nothing connected yet
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Connect a service above or add a webhook.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between gap-4 px-4 py-3.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Webhook className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {integration.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {integration.type === "webhook"
                        ? integration.url
                        : "Connected service"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggle(integration)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${
                      integration.enabled ? "bg-violet-600" : "bg-slate-200"
                    }`}
                    title={integration.enabled ? "Disable" : "Enable"}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        integration.enabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(integration.id)}
                    title="Remove"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
