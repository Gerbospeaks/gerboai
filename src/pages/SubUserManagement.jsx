// src/pages/SubUserManagement.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getFirestore,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { X, UserPlus, Trash2, Shield, Edit2, Mail } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const PERMISSION_LABELS = {
  createInvoice: "Create Invoices",
  createQuote: "Create Quotes",
  createPO: "Create Purchase Orders",
  addClients: "Add Clients",
  viewReports: "View Reports",
};

const SubUserManagement = ({ onClose }) => {
  const { user } = useAuth();
  const [subUsers, setSubUsers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    permissions: {
      createInvoice: true,
      createQuote: true,
      createPO: false,
      addClients: true,
      viewReports: false,
    },
  });

  useEffect(() => {
    loadSubUsers();
  }, []);

  const loadSubUsers = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const q = query(
      collection(db, "subUsers"),
      where("createdBy", "==", user.uid),
    );
    const snap = await getDocs(q);
    setSubUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const handleAddSubUser = async () => {
    if (!form.email || !form.name || !form.password) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const db = getFirestore();
      // Create Firebase auth user
      const auth = getAuth();
      const { user: newUser } = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password,
      );

      // Store sub-user data linked to the admin
      await addDoc(collection(db, "subUsers"), {
        uid: newUser.uid,
        email: form.email,
        name: form.name,
        createdBy: user.uid, // links to admin
        role: "sub_user",
        permissions: form.permissions,
        active: true,
        createdAt: serverTimestamp(),
      });

      // Also write to the users collection so the hook can read it
      await addDoc(collection(db, "users"), {
        uid: newUser.uid,
        email: form.email,
        name: form.name,
        role: "sub_user",
        createdBy: user.uid,
        permissions: form.permissions,
        createdAt: serverTimestamp(),
      });

      alert(
        `Sub-user ${form.name} created! A password reset email will be sent.`,
      );
      await sendPasswordResetEmail(auth, form.email);
      setShowAddForm(false);
      setForm({
        email: "",
        name: "",
        password: "",
        permissions: {
          createInvoice: true,
          createQuote: true,
          createPO: false,
          addClients: true,
          viewReports: false,
        },
      });
      loadSubUsers();
    } catch (error) {
      alert("Failed to create sub-user: " + error.message);
    }
    setLoading(false);
  };

  const handleTogglePermission = async (subUserId, permission, current) => {
    const db = getFirestore();
    await updateDoc(doc(db, "subUsers", subUserId), {
      [`permissions.${permission}`]: !current,
    });
    loadSubUsers();
  };

  const handleDeactivate = async (subUserId) => {
    if (!window.confirm("Deactivate this user?")) return;
    const db = getFirestore();
    await updateDoc(doc(db, "subUsers", subUserId), { active: false });
    loadSubUsers();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#7c3aed] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1e293b]">
                Team Members
              </h2>
              <p className="text-xs text-[#64748b]">
                {subUsers.length} sub-users
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#e2e8f0] rounded-lg"
            >
              <X className="w-4 h-4 text-[#64748b]" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Add form */}
          {showAddForm && (
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">
                New Sub-User
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Smith"
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="jane@example.com"
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                    Temp Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                  />
                </div>
              </div>

              {/* Permissions */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-[#374151] uppercase tracking-wide mb-2">
                  Permissions
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.permissions[key]}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            permissions: {
                              ...form.permissions,
                              [key]: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 accent-[#7c3aed]"
                      />
                      <span className="text-xs text-[#374151]">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddSubUser}
                  disabled={loading}
                  className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create User"}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-white border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-lg hover:bg-[#f8fafc] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Sub-users list */}
          {subUsers.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
              <p className="text-sm text-[#94a3b8]">No team members yet</p>
              <p className="text-xs text-[#cbd5e1] mt-1">
                Add sub-users to delegate work
              </p>
            </div>
          ) : (
            subUsers.map((su) => (
              <div
                key={su.id}
                className="bg-white border border-[#e2e8f0] rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#7c3aed] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {su.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1e293b]">
                        {su.name}
                      </p>
                      <p className="text-xs text-[#64748b]">{su.email}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${su.active ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fef2f2] text-[#991b1b]"}`}
                    >
                      {su.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        sendPasswordResetEmail(getAuth(), su.email)
                      }
                      title="Send password reset"
                      className="p-1.5 text-[#64748b] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeactivate(su.id)}
                      className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Permission toggles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() =>
                        handleTogglePermission(
                          su.id,
                          key,
                          su.permissions?.[key],
                        )
                      }
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        su.permissions?.[key]
                          ? "bg-[#dcfce7] text-[#166534]"
                          : "bg-[#f1f5f9] text-[#94a3b8]"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${su.permissions?.[key] ? "bg-[#059669]" : "bg-[#cbd5e1]"}`}
                      />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SubUserManagement;
