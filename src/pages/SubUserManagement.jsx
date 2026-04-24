import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Edit2,
  Loader2,
  Plus,
  Shield,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

// ── Permission definitions ─────────────────────────────────────────────────
const ALL_PERMISSIONS = [
  {
    key: "createInvoice",
    label: "Create Invoice",
    description: "Create and edit invoices",
  },
  {
    key: "createQuote",
    label: "Create Quote",
    description: "Create and edit quotes",
  },
  {
    key: "viewReports",
    label: "View Reports",
    description: "Access financial reports",
  },
  {
    key: "manageCustomers",
    label: "Manage Customers",
    description: "Add and edit customers",
  },
  {
    key: "manageInventory",
    label: "Manage Inventory",
    description: "Access parts inventory",
  },
  {
    key: "processPayments",
    label: "Process Payments",
    description: "Record and process payments",
  },
  {
    key: "managePurchaseOrders",
    label: "Purchase Orders",
    description: "Create and manage POs",
  },
  {
    key: "viewHistory",
    label: "View History",
    description: "Access job card history",
  },
];

const ROLES = [
  {
    value: "admin",
    label: "Admin",
    description: "Full access, cannot manage billing",
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    value: "technician",
    label: "Technician",
    description: "Job cards, invoices, customers",
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    value: "receptionist",
    label: "Receptionist",
    description: "Customers and quotes only",
    color: "#059669",
    bg: "#f0fdf4",
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Read-only access",
    color: "#64748b",
    bg: "#f8fafc",
  },
];

const ROLE_DEFAULT_PERMISSIONS = {
  admin: ALL_PERMISSIONS.map((p) => p.key),
  technician: [
    "createInvoice",
    "createQuote",
    "manageCustomers",
    "processPayments",
    "viewHistory",
  ],
  receptionist: ["createQuote", "manageCustomers"],
  viewer: ["viewHistory", "viewReports"],
};

// ── Helpers ────────────────────────────────────────────────────────────────
const statusBadge = (active) =>
  active
    ? { bg: "#dcfce7", color: "#166534", label: "Active" }
    : { bg: "#fef2f2", color: "#991b1b", label: "Inactive" };

const getRoleMeta = (role) => ROLES.find((r) => r.value === role) ?? ROLES[3];

// ── Main component ─────────────────────────────────────────────────────────
const SubUserManagement = ({ onClose }) => {
  const { user, authUser } = useAuth();
  const db = getFirestore();

  const [subUsers, setSubUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("list"); // 'list' | 'create' | 'edit'
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "technician",
    permissions: ROLE_DEFAULT_PERMISSIONS.technician,
    active: true,
  });

  const parentUid = user?.uid;

  // ── Load sub-users ─────────────────────────────────────────────────────
  const loadSubUsers = async () => {
    if (!parentUid) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        collection(db, "users", parentUid, "subusers"),
      );
      setSubUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      showToast("Failed to load team members", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubUsers();
  }, [parentUid]);

  // ── Toast helper ───────────────────────────────────────────────────────
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Form helpers ───────────────────────────────────────────────────────
  const resetForm = () =>
    setForm({
      name: "",
      email: "",
      password: "",
      role: "technician",
      permissions: ROLE_DEFAULT_PERMISSIONS.technician,
      active: true,
    });

  const handleRoleChange = (role) =>
    setForm((p) => ({
      ...p,
      role,
      permissions: ROLE_DEFAULT_PERMISSIONS[role] ?? [],
    }));

  const togglePermission = (key) =>
    setForm((p) => ({
      ...p,
      permissions: p.permissions.includes(key)
        ? p.permissions.filter((k) => k !== key)
        : [...p.permissions, key],
    }));

  // ── Create sub-user ────────────────────────────────────────────────────
  // Creates a Firebase Auth account, then writes to:
  //   users/{parentUid}/subusers/{newUid}   ← sub-user record
  //   users/{newUid}                        ← top-level profile (for useSubAccount)
  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      showToast("Please fill all fields (password min 6 chars)", "error");
      return;
    }
    setSaving(true);
    try {
      // 1. Remember the current admin's credentials so we can restore session
      const auth = getAuth();
      const adminEmail = authUser?.email;
      const adminPassword = ""; // We cannot re-auth without their password here,
      // so we use a secondary Auth instance approach below.

      // 2. Create the Firebase Auth user
      // Use a secondary auth instance to avoid signing out the current admin
      const { initializeApp, getApps } = await import("firebase/app");
      const {
        getAuth: getSecondaryAuth,
        createUserWithEmailAndPassword: createSecondary,
      } = await import("firebase/auth");

      const secondaryApp =
        getApps().find((a) => a.name === "secondary") ??
        initializeApp(
          {
            apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
            authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
            storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
            messagingSenderId:
              process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.REACT_APP_FIREBASE_APP_ID,
          },
          "secondary",
        );

      const secondaryAuth = getSecondaryAuth(secondaryApp);
      const cred = await createSecondary(
        secondaryAuth,
        form.email.trim(),
        form.password,
      );
      const newUid = cred.user.uid;

      // Sign out from secondary instance immediately
      await secondaryAuth.signOut();

      const parentSnap = await getDoc(doc(db, "users", parentUid));
      const parentData = parentSnap.exists() ? parentSnap.data() : {};

      const subUserData = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        permissions: form.permissions,
        active: form.active,
        parentUid,
        isSubUser: true,
        // Inherit from parent so login routing works without an extra fetch
        dashboardId: parentData.dashboardId || null,
        industry: parentData.industry || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 4. Write into parent's subusers sub-collection
      //    Path: users/{parentUid}/subusers/{newUid}
      await setDoc(
        doc(db, "users", parentUid, "subusers", newUid),
        subUserData,
      );

      // 5. Write top-level profile so useSubAccount + AuthContext can resolve parentUid
      //    Path: users/{newUid}
      await setDoc(doc(db, "users", newUid), {
        ...subUserData,
        uid: newUid,
      });

      showToast(`${form.name} added to your team!`);
      resetForm();
      setActiveTab("list");
      loadSubUsers();
    } catch (e) {
      console.error("Create sub-user error:", e);
      const msg =
        e.code === "auth/email-already-in-use"
          ? "That email is already registered"
          : e.code === "auth/invalid-email"
            ? "Invalid email address"
            : "Failed to create account: " + e.message;
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Update sub-user (permissions / role / active) ─────────────────────
  const handleUpdate = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        role: form.role,
        permissions: form.permissions,
        active: form.active,
        updatedAt: serverTimestamp(),
      };

      // Update sub-collection record
      await updateDoc(
        doc(db, "users", parentUid, "subusers", editingUser.id),
        payload,
      );

      // Update top-level profile too
      await updateDoc(doc(db, "users", editingUser.id), payload);

      showToast("Team member updated");
      setEditingUser(null);
      setActiveTab("list");
      loadSubUsers();
    } catch (e) {
      showToast("Failed to update: " + e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete sub-user ────────────────────────────────────────────────────
  const handleDelete = async (subUser) => {
    try {
      await deleteDoc(doc(db, "users", parentUid, "subusers", subUser.id));
      // Note: Firebase Auth account is NOT deleted here (requires Admin SDK).
      // The top-level users/{uid} doc is intentionally kept for audit trail.
      showToast(`${subUser.name} removed from team`);
      setDeleteConfirm(null);
      loadSubUsers();
    } catch (e) {
      showToast("Failed to delete: " + e.message, "error");
    }
  };

  // ── Open edit form ────────────────────────────────────────────────────
  const openEdit = (su) => {
    setEditingUser(su);
    setForm({
      name: su.name || "",
      email: su.email || "",
      password: "",
      role: su.role || "viewer",
      permissions: su.permissions || [],
      active: su.active ?? true,
    });
    setActiveTab("edit");
  };

  // ── UI helpers ─────────────────────────────────────────────────────────
  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
  const labelCls =
    "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

  // ── RENDER ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === "error"
              ? "bg-[#fef2f2] border border-[#fecaca] text-[#991b1b]"
              : "bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534]"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#7c3aed] rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1e293b]">
                Team Management
              </h2>
              <p className="text-xs text-[#64748b]">
                {subUsers.length} member{subUsers.length !== 1 ? "s" : ""} on
                your team
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "list" && (
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab("create");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-medium rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Member
              </button>
            )}
            {(activeTab === "create" || activeTab === "edit") && (
              <button
                onClick={() => {
                  setActiveTab("list");
                  setEditingUser(null);
                  resetForm();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-xs font-medium rounded-lg hover:bg-[#f8fafc] transition-colors"
              >
                Back to list
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* ── LIST TAB ── */}
          {activeTab === "list" && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-[#7c3aed] animate-spin" />
                </div>
              ) : subUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="w-12 h-12 bg-[#f5f3ff] rounded-full flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-[#7c3aed]" />
                  </div>
                  <p className="text-sm font-semibold text-[#1e293b] mb-1">
                    No team members yet
                  </p>
                  <p className="text-xs text-[#94a3b8] mb-4">
                    Add staff accounts so your team can log in with their own
                    credentials
                  </p>
                  <button
                    onClick={() => {
                      resetForm();
                      setActiveTab("create");
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Member
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#f1f5f9]">
                  {subUsers.map((su) => {
                    const role = getRoleMeta(su.role);
                    const badge = statusBadge(su.active);
                    return (
                      <div
                        key={su.id}
                        className="flex items-center justify-between px-6 py-4 hover:bg-[#f8fafc] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                            style={{ background: role.bg, color: role.color }}
                          >
                            {(su.name || su.email || "?")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-[#1e293b] truncate">
                                {su.name || "Unnamed"}
                              </span>
                              <span
                                className="px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0"
                                style={{
                                  background: role.bg,
                                  color: role.color,
                                }}
                              >
                                {role.label}
                              </span>
                              <span
                                className="px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0"
                                style={{
                                  background: badge.bg,
                                  color: badge.color,
                                }}
                              >
                                {badge.label}
                              </span>
                            </div>
                            <p className="text-xs text-[#64748b] truncate mt-0.5">
                              {su.email}
                            </p>
                            <p className="text-xs text-[#94a3b8] mt-0.5">
                              {su.permissions?.length ?? 0} permissions
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <button
                            onClick={() => openEdit(su)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#eff6ff] hover:border-[#bfdbfe] text-[#64748b] hover:text-[#2563eb] transition-all text-xs font-semibold"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(su)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#fef2f2] hover:border-[#fecaca] text-[#94a3b8] hover:text-[#dc2626] transition-all text-xs font-semibold"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── CREATE / EDIT FORM ── */}
          {(activeTab === "create" || activeTab === "edit") && (
            <div className="p-6 space-y-6">
              {/* Basic info */}
              <div>
                <h3 className="text-sm font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#7c3aed]" />
                  {activeTab === "create" ? "New Team Member" : "Edit Member"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Full Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="Jane Smith"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Email Address *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="jane@workshop.co.za"
                      disabled={activeTab === "edit"}
                      className={`${inputCls} ${activeTab === "edit" ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                  </div>
                  {activeTab === "create" && (
                    <div>
                      <label className={labelCls}>Password *</label>
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, password: e.target.value }))
                        }
                        placeholder="Min 6 characters"
                        className={inputCls}
                      />
                    </div>
                  )}
                  <div>
                    <label className={labelCls}>Status</label>
                    <select
                      value={form.active ? "active" : "inactive"}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          active: e.target.value === "active",
                        }))
                      }
                      className={inputCls}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Role selector */}
              <div>
                <h3 className="text-sm font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#7c3aed]" />
                  Role
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => handleRoleChange(r.value)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        form.role === r.value
                          ? "border-[#7c3aed] shadow-sm"
                          : "border-[#e2e8f0] hover:border-[#c4b5fd]"
                      }`}
                      style={
                        form.role === r.value
                          ? { background: r.bg }
                          : { background: "#f8fafc" }
                      }
                    >
                      <div
                        className="text-xs font-bold mb-0.5"
                        style={{
                          color: form.role === r.value ? r.color : "#374151",
                        }}
                      >
                        {r.label}
                      </div>
                      <div className="text-xs text-[#94a3b8] leading-tight">
                        {r.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#1e293b] flex items-center gap-2">
                    <ChevronDown className="w-4 h-4 text-[#7c3aed]" />
                    Permissions
                  </h3>
                  <span className="text-xs text-[#64748b]">
                    {form.permissions.length}/{ALL_PERMISSIONS.length} enabled
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_PERMISSIONS.map((p) => {
                    const enabled = form.permissions.includes(p.key);
                    return (
                      <button
                        key={p.key}
                        onClick={() => togglePermission(p.key)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          enabled
                            ? "bg-[#f5f3ff] border-[#c4b5fd]"
                            : "bg-[#f8fafc] border-[#e2e8f0] hover:border-[#c4b5fd]"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                            enabled ? "bg-[#7c3aed]" : "bg-[#e2e8f0]"
                          }`}
                        >
                          {enabled && (
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div
                            className={`text-xs font-semibold ${enabled ? "text-[#5b21b6]" : "text-[#374151]"}`}
                          >
                            {p.label}
                          </div>
                          <div className="text-xs text-[#94a3b8]">
                            {p.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {(activeTab === "create" || activeTab === "edit") && (
          <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between flex-shrink-0">
            <p className="text-xs text-[#94a3b8]">
              {activeTab === "create"
                ? "A login account will be created for this team member"
                : `Editing ${editingUser?.name || "team member"}`}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveTab("list");
                  setEditingUser(null);
                  resetForm();
                }}
                className="px-4 py-2 text-sm font-medium text-[#374151] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={activeTab === "create" ? handleCreate : handleUpdate}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#7c3aed] hover:bg-[#6d28d9] rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {activeTab === "create" ? "Create Account" : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-[#e2e8f0]">
            <div className="w-10 h-10 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-[#dc2626]" />
            </div>
            <h3 className="text-sm font-semibold text-[#1e293b] text-center mb-1">
              Remove {deleteConfirm.name}?
            </h3>
            <p className="text-xs text-[#64748b] text-center mb-5">
              This removes their access to your dashboard. Their Firebase Auth
              account will remain but can no longer log in here.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 text-sm font-medium text-[#374151] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 text-sm font-medium text-white bg-[#dc2626] hover:bg-[#b91c1c] rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubUserManagement;
