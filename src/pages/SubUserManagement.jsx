import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  AlertTriangle,
  Car,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Lock,
  Package,
  Plus,
  Receipt,
  RefreshCw,
  Shield,
  ShieldCheck,
  ShieldOff,
  Square,
  Trash2,
  Truck,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";

// ─── Firebase config (same project, secondary app for creating users) ─────────
// We pull the config from the already-initialised primary app so you don't
// need to duplicate env vars.
const getSecondaryAuth = () => {
  const existing = getApps().find((a) => a.name === "secondary");
  if (existing) return getAuth(existing);
  // Mirror the primary app's config
  const primaryApp = getApps().find((a) => a.name === "[DEFAULT]");
  const cfg = primaryApp?.options;
  if (!cfg) throw new Error("Primary Firebase app not initialised");
  const secondary = initializeApp(cfg, "secondary");
  return getAuth(secondary);
};

// ─── Permission definitions ───────────────────────────────────────────────────
const ALL_PERMISSIONS = [
  {
    id: "invoice",
    label: "Create Invoice",
    icon: FileText,
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    id: "quote",
    label: "Create Quote",
    icon: Receipt,
    color: "#0d9488",
    bg: "#f0fdfa",
  },
  {
    id: "purchase_order",
    label: "Purchase Order",
    icon: Truck,
    color: "#7c3aed",
    bg: "#faf5ff",
  },
  {
    id: "add_client",
    label: "Add Client",
    icon: Users,
    color: "#059669",
    bg: "#f0fdf4",
  },
  {
    id: "add_vehicle",
    label: "Add Vehicle",
    icon: Car,
    color: "#0284c7",
    bg: "#f0f9ff",
  },
  {
    id: "add_part",
    label: "Add Part",
    icon: Package,
    color: "#ea580c",
    bg: "#fff7ed",
  },
];

const DEFAULT_PERMISSIONS = ALL_PERMISSIONS.map((p) => p.id);

// ─── Shared style tokens ──────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2.5 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

// ─── Password generator ───────────────────────────────────────────────────────
const genPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  return Array.from({ length: 12 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
};

// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl border shadow-xl text-sm font-medium transition-all
        ${
          type === "success"
            ? "bg-[#f0fdf4] border-[#86efac] text-[#166534]"
            : type === "error"
              ? "bg-[#fef2f2] border-[#fca5a5] text-[#991b1b]"
              : "bg-[#eff6ff] border-[#bfdbfe] text-[#1e40af]"
        }`}
    >
      {type === "success" ? (
        <Check className="w-4 h-4 flex-shrink-0" />
      ) : (
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      )}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM DIALOG
// ─────────────────────────────────────────────────────────────────────────────
const ConfirmDialog = ({ message, onConfirm, onCancel, danger }) => (
  <div className="fixed inset-0 bg-black/60 z-[9998] flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-[#e2e8f0]">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? "bg-[#fef2f2]" : "bg-[#eff6ff]"}`}
      >
        <AlertTriangle
          className={`w-6 h-6 ${danger ? "text-[#dc2626]" : "text-[#2563eb]"}`}
        />
      </div>
      <p className="text-sm text-center text-[#374151] mb-6 leading-relaxed">
        {message}
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-sm font-semibold text-[#374151] hover:bg-[#f8fafc] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${danger ? "bg-[#dc2626] hover:bg-[#b91c1c]" : "bg-[#2563eb] hover:bg-[#1d4ed8]"}`}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// PERMISSION CHECKBOX ROW
// ─────────────────────────────────────────────────────────────────────────────
const PermissionToggle = ({ perm, checked, onChange, disabled }) => {
  const Icon = perm.icon;
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(perm.id)}
      disabled={disabled}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left w-full
        ${
          checked
            ? "border-[#bfdbfe] bg-[#eff6ff]"
            : "border-[#e2e8f0] bg-white hover:bg-[#f8fafc]"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: checked ? perm.bg : "#f1f5f9" }}
      >
        <Icon
          className="w-3.5 h-3.5"
          style={{ color: checked ? perm.color : "#94a3b8" }}
        />
      </div>
      <span
        className={`text-xs font-semibold flex-1 ${checked ? "text-[#1e293b]" : "text-[#64748b]"}`}
      >
        {perm.label}
      </span>
      <div
        className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
          checked
            ? "bg-[#2563eb] border-[#2563eb]"
            : "bg-white border-[#d1d5db]"
        }`}
      >
        {checked && (
          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        )}
      </div>
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-USER CARD
// ─────────────────────────────────────────────────────────────────────────────
const SubUserCard = ({
  user: su,
  onToggleDisable,
  onDelete,
  onEditPermissions,
  loading,
}) => {
  const [expanded, setExpanded] = useState(false);
  const initials = (su.email || "?").substring(0, 2).toUpperCase();
  const isDisabled = su.disabled;

  return (
    <div
      className={`bg-white border rounded-2xl overflow-hidden transition-all shadow-sm
        ${isDisabled ? "border-[#e2e8f0] opacity-70" : "border-[#e2e8f0] hover:border-[#bfdbfe] hover:shadow-md"}`}
    >
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0
            ${isDisabled ? "bg-[#f1f5f9] text-[#94a3b8]" : "bg-[#0f172a] text-white"}`}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[#1e293b] truncate">
              {su.name || su.email}
            </span>
            {isDisabled ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fef2f2] text-[#dc2626] border border-[#fca5a5]">
                DISABLED
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f0fdf4] text-[#059669] border border-[#86efac]">
                ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748b] truncate">{su.email}</p>
          {su.createdAt?.toDate && (
            <p className="text-[10px] text-[#94a3b8]">
              Added{" "}
              {su.createdAt.toDate().toLocaleDateString("en-ZA", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onToggleDisable(su)}
            disabled={loading === su.id}
            title={isDisabled ? "Re-enable user" : "Disable user"}
            className={`p-2 rounded-lg border transition-all text-xs font-medium
              ${
                isDisabled
                  ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#059669] hover:bg-[#dcfce7]"
                  : "border-[#fecaca] bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2]"
              }
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading === su.id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isDisabled ? (
              <UserCheck className="w-3.5 h-3.5" />
            ) : (
              <UserMinus className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => setExpanded((p) => !p)}
            className="p-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] hover:bg-[#eff6ff] hover:text-[#2563eb] hover:border-[#bfdbfe] transition-all"
            title="Edit permissions"
          >
            <Shield className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(su)}
            className="p-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] hover:bg-[#fef2f2] hover:text-[#dc2626] hover:border-[#fca5a5] transition-all"
            title="Delete sub-user"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setExpanded((p) => !p)}
            className="p-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] hover:bg-[#f1f5f9] transition-all"
          >
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Permission pills (always visible compact) */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        {ALL_PERMISSIONS.map((p) => {
          const has = (su.permissions || []).includes(p.id);
          const Icon = p.icon;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border
                ${has ? "border-transparent text-white" : "border-[#e2e8f0] bg-[#f1f5f9] text-[#94a3b8]"}`}
              style={has ? { background: p.color } : {}}
            >
              <Icon className="w-2.5 h-2.5" />
              {p.label}
            </div>
          );
        })}
      </div>

      {/* Expanded permissions editor */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-[#f1f5f9] pt-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-[#374151] uppercase tracking-wide flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#2563eb]" />
              Edit Permissions
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() =>
                  onEditPermissions(
                    su,
                    ALL_PERMISSIONS.map((p) => p.id),
                  )
                }
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-[#2563eb] border border-[#bfdbfe] bg-[#eff6ff] rounded-lg hover:bg-[#dbeafe] transition-colors"
              >
                <CheckSquare className="w-3 h-3" /> All
              </button>
              <button
                onClick={() => onEditPermissions(su, [])}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-[#64748b] border border-[#e2e8f0] bg-[#f8fafc] rounded-lg hover:bg-[#f1f5f9] transition-colors"
              >
                <Square className="w-3 h-3" /> None
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ALL_PERMISSIONS.map((perm) => (
              <PermissionToggle
                key={perm.id}
                perm={perm}
                checked={(su.permissions || []).includes(perm.id)}
                onChange={(id) => {
                  const current = su.permissions || [];
                  const next = current.includes(id)
                    ? current.filter((p) => p !== id)
                    : [...current, id];
                  onEditPermissions(su, next);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE SUB-USER FORM (inline panel)
// ─────────────────────────────────────────────────────────────────────────────
const CreateSubUserForm = ({ parentUid, onCreated, onCancel }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(genPassword());
  const [showPass, setShowPass] = useState(false);
  const [permissions, setPermissions] = useState([...DEFAULT_PERMISSIONS]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const togglePerm = (id) =>
    setPermissions((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

  const copyPassword = () => {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCreate = async () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setError("");
    setCreating(true);
    try {
      // 1. Create Auth user via secondary app
      const secondaryAuth = getSecondaryAuth();
      const { user: newUser } = await createUserWithEmailAndPassword(
        secondaryAuth,
        email.trim(),
        password,
      );
      // Sign out of secondary app immediately so primary session is untouched
      await firebaseSignOut(secondaryAuth);

      // 2. Write Firestore profile under the parent account's user doc
      const db = getFirestore();
      await setDoc(doc(db, "users", newUser.uid), {
        uid: newUser.uid,
        email: email.trim(),
        name: name.trim() || email.trim(),
        role: "subuser",
        parentUid,
        permissions,
        disabled: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 3. Also register in parent's subUsers subcollection for easy listing
      await setDoc(doc(db, "users", parentUid, "subUsers", newUser.uid), {
        uid: newUser.uid,
        email: email.trim(),
        name: name.trim() || email.trim(),
        role: "subuser",
        permissions,
        disabled: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      onCreated({
        uid: newUser.uid,
        email: email.trim(),
        name: name.trim() || email.trim(),
        permissions,
        disabled: false,
      });
    } catch (e) {
      console.error(e);
      setError(
        e.code === "auth/email-already-in-use"
          ? "That email is already registered."
          : e.message,
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1e293b]">New Sub-User</h3>
            <p className="text-xs text-[#64748b]">
              Account scoped to your business
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#e2e8f0] rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Display Name</label>
          <input
            className={inputCls}
            placeholder="e.g. John (Mechanic)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Email Address *</label>
          <input
            type="email"
            className={inputCls}
            placeholder="tech@workshop.co.za"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className={labelCls}>Temporary Password *</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showPass ? "text" : "password"}
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#374151] transition-colors"
            >
              {showPass ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setPassword(genPassword())}
            title="Generate new password"
            className="px-3 py-2.5 border border-[#e2e8f0] bg-white rounded-lg text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#374151] transition-all flex-shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={copyPassword}
            title="Copy password"
            className={`px-3 py-2.5 border rounded-lg transition-all flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold
              ${
                copied
                  ? "border-[#86efac] bg-[#f0fdf4] text-[#059669]"
                  : "border-[#e2e8f0] bg-white text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#374151]"
              }`}
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="text-[10px] text-[#94a3b8] mt-1.5 flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Share this password with the sub-user. They can change it after first
          login.
        </p>
      </div>

      {/* Permissions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className={labelCls + " mb-0"}>Permissions</label>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setPermissions(ALL_PERMISSIONS.map((p) => p.id))}
              className="text-[10px] font-semibold text-[#2563eb] px-2 py-1 border border-[#bfdbfe] bg-[#eff6ff] rounded-lg hover:bg-[#dbeafe] transition-colors"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => setPermissions([])}
              className="text-[10px] font-semibold text-[#64748b] px-2 py-1 border border-[#e2e8f0] bg-white rounded-lg hover:bg-[#f1f5f9] transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ALL_PERMISSIONS.map((perm) => (
            <PermissionToggle
              key={perm.id}
              perm={perm}
              checked={permissions.includes(perm.id)}
              onChange={togglePerm}
            />
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-[#fef2f2] border border-[#fca5a5] rounded-xl text-sm text-[#991b1b]">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-semibold text-[#374151] hover:bg-[#f1f5f9] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={creating || !email}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {creating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Creating…
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" /> Create Sub-User
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const SubUserManagement = ({ onClose }) => {
  const { user } = useAuth();
  const [subUsers, setSubUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // uid
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const overlayRef = useRef(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  // ── Load sub-users ─────────────────────────────────────────────────────────
  const loadSubUsers = useCallback(async () => {
    if (!user?.uid) return;
    setLoadingUsers(true);
    try {
      const db = getFirestore();
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "subUsers"),
          orderBy("createdAt", "desc"),
        ),
      );
      setSubUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error loading sub-users:", e);
      showToast("Failed to load sub-users", "error");
    } finally {
      setLoadingUsers(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadSubUsers();
  }, [loadSubUsers]);

  // ── Handle created ─────────────────────────────────────────────────────────
  const handleCreated = (newUser) => {
    setSubUsers((p) => [
      { id: newUser.uid, ...newUser, createdAt: { toDate: () => new Date() } },
      ...p,
    ]);
    setShowCreateForm(false);
    showToast(`Sub-user ${newUser.email} created successfully`);
  };

  // ── Toggle disable ─────────────────────────────────────────────────────────
  const handleToggleDisable = (su) => {
    const action = su.disabled ? "re-enable" : "disable";
    setConfirm({
      message: `Are you sure you want to ${action} ${su.email}?`,
      danger: !su.disabled,
      onConfirm: async () => {
        setConfirm(null);
        setActionLoading(su.id);
        try {
          const db = getFirestore();
          const newVal = !su.disabled;
          await updateDoc(doc(db, "users", user.uid, "subUsers", su.id), {
            disabled: newVal,
            updatedAt: serverTimestamp(),
          });
          // Also update the sub-user's own profile doc
          await updateDoc(doc(db, "users", su.id), {
            disabled: newVal,
            updatedAt: serverTimestamp(),
          }).catch(() => {}); // might not exist if secondary app failed
          setSubUsers((p) =>
            p.map((u) => (u.id === su.id ? { ...u, disabled: newVal } : u)),
          );
          showToast(
            `${su.email} has been ${newVal ? "disabled" : "re-enabled"}`,
          );
        } catch (e) {
          showToast("Failed to update user status", "error");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = (su) => {
    setConfirm({
      message: `Permanently delete ${su.email}? This cannot be undone. Their Firestore profile and sub-user record will be removed (Firebase Auth deletion requires Admin SDK / Cloud Function).`,
      danger: true,
      onConfirm: async () => {
        setConfirm(null);
        setActionLoading(su.id);
        try {
          const db = getFirestore();
          await deleteDoc(doc(db, "users", user.uid, "subUsers", su.id));
          // Best-effort: also remove their own user profile doc
          await deleteDoc(doc(db, "users", su.id)).catch(() => {});
          setSubUsers((p) => p.filter((u) => u.id !== su.id));
          showToast(`${su.email} deleted`);
        } catch (e) {
          showToast("Failed to delete user", "error");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  // ── Edit permissions ───────────────────────────────────────────────────────
  const handleEditPermissions = async (su, newPerms) => {
    try {
      const db = getFirestore();
      await updateDoc(doc(db, "users", user.uid, "subUsers", su.id), {
        permissions: newPerms,
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "users", su.id), {
        permissions: newPerms,
        updatedAt: serverTimestamp(),
      }).catch(() => {});
      setSubUsers((p) =>
        p.map((u) => (u.id === su.id ? { ...u, permissions: newPerms } : u)),
      );
    } catch (e) {
      showToast("Failed to update permissions", "error");
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const activeCount = subUsers.filter((u) => !u.disabled).length;
  const disabledCount = subUsers.filter((u) => u.disabled).length;

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === overlayRef.current && onClose()}
      >
        {/* Modal */}
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
          {/* ── HEADER ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#f1f5f9] bg-[#0f172a] rounded-t-3xl flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  Sub-User Management
                </h2>
                <p className="text-xs text-white/50">
                  Control who can access your account
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── STATS BAR ───────────────────────────────────────────────── */}
          <div className="flex items-stretch divide-x divide-[#f1f5f9] bg-[#f8fafc] border-b border-[#e2e8f0] flex-shrink-0">
            {[
              {
                label: "Total Sub-Users",
                value: subUsers.length,
                icon: Users,
                color: "text-[#2563eb]",
                bg: "bg-[#eff6ff]",
              },
              {
                label: "Active",
                value: activeCount,
                icon: ShieldCheck,
                color: "text-[#059669]",
                bg: "bg-[#f0fdf4]",
              },
              {
                label: "Disabled",
                value: disabledCount,
                icon: ShieldOff,
                color: "text-[#dc2626]",
                bg: "bg-[#fef2f2]",
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="flex-1 flex items-center gap-3 px-4 py-3"
              >
                <div
                  className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#1e293b] leading-tight">
                    {loadingUsers ? "–" : value}
                  </p>
                  <p className="text-[10px] text-[#64748b]">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── SCROLLABLE BODY ──────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-4">
              {/* Create form or Add button */}
              {showCreateForm ? (
                <CreateSubUserForm
                  parentUid={user?.uid}
                  onCreated={handleCreated}
                  onCancel={() => setShowCreateForm(false)}
                />
              ) : (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-2xl text-sm font-semibold transition-all shadow-sm hover:shadow-md group"
                >
                  <div className="w-6 h-6 bg-white/15 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  Add New Sub-User
                </button>
              )}

              {/* Sub-user list */}
              {loadingUsers ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-8 h-8 text-[#cbd5e1] animate-spin" />
                  <p className="text-sm text-[#94a3b8]">Loading users…</p>
                </div>
              ) : subUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-[#e2e8f0] rounded-2xl">
                  <div className="w-16 h-16 bg-[#f1f5f9] rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-7 h-7 text-[#94a3b8]" />
                  </div>
                  <p className="text-sm font-semibold text-[#374151] mb-1">
                    No sub-users yet
                  </p>
                  <p className="text-xs text-[#94a3b8] max-w-xs">
                    Add your first sub-user above. They'll have restricted
                    access scoped only to your business data.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subUsers.map((su) => (
                    <SubUserCard
                      key={su.id}
                      user={su}
                      onToggleDisable={handleToggleDisable}
                      onDelete={handleDelete}
                      onEditPermissions={handleEditPermissions}
                      loading={actionLoading}
                    />
                  ))}
                </div>
              )}

              {/* Info callout */}
              <div className="flex items-start gap-3 px-4 py-3.5 bg-[#fffbeb] border border-[#fde68a] rounded-xl">
                <AlertTriangle className="w-4 h-4 text-[#d97706] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[#92400e] mb-0.5">
                    Important
                  </p>
                  <p className="text-xs text-[#78350f] leading-relaxed">
                    Sub-users can only see and create data within your account.
                    They cannot view financials, reports, settings, or other
                    sub-users. Deleting a sub-user from Firestore does{" "}
                    <strong>not</strong> remove their Firebase Auth account —
                    use your Firebase Console or a Cloud Function to fully
                    revoke login access.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── FOOTER ──────────────────────────────────────────────────── */}
          <div className="px-5 py-3.5 border-t border-[#e2e8f0] bg-[#f8fafc] rounded-b-3xl flex items-center justify-between flex-shrink-0">
            <button
              onClick={loadSubUsers}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#64748b] hover:text-[#374151] border border-[#e2e8f0] bg-white hover:bg-[#f1f5f9] rounded-lg transition-all"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          danger={confirm.danger}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default SubUserManagement;
