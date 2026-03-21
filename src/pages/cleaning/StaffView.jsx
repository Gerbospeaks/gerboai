import React, { useState, useEffect } from "react";
import { UserCheck, Plus, X, Save, Edit2, Trash2, Phone, Mail, MapPin, Star, User } from "lucide-react";
import { db } from "../../firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";

const ROLES = ["Cleaner", "Senior Cleaner", "Team Leader", "Supervisor", "Manager", "Driver"];
const STATUS_OPT = ["Active", "On Leave", "Inactive"];

const EMPTY = { firstName: "", lastName: "", phone: "", email: "", role: "Cleaner", status: "Active", address: "", idNumber: "", startDate: "", hourlyRate: "", notes: "", emergencyContact: "", emergencyPhone: "" };

export default function StaffView({ user, openNew = false }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(openNew);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, [user]);

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const q = query(collection(db, "users", user.uid, "staff"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (s) => { setEditItem(s); setForm({ ...EMPTY, ...s }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName) return alert("First and last name required");
    setSaving(true);
    try {
      const data = { ...form, fullName: `${form.firstName} ${form.lastName}`, updatedAt: serverTimestamp() };
      if (editItem) await updateDoc(doc(db, "users", user.uid, "staff", editItem.id), data);
      else await addDoc(collection(db, "users", user.uid, "staff"), { ...data, createdAt: serverTimestamp() });
      setShowModal(false); load();
    } catch (e) { alert("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this staff member?")) return;
    await deleteDoc(doc(db, "users", user.uid, "staff", id)); load();
  };

  const filtered = staff.filter(s =>
    !search || `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) || s.role?.toLowerCase().includes(search.toLowerCase())
  );

  const STATUS_STYLES = { Active: "bg-[#dcfce7] text-[#166534]", "On Leave": "bg-[#fef3c7] text-[#92400e]", Inactive: "bg-[#fee2e2] text-[#991b1b]" };

  const getInitials = (s) => `${s.firstName?.[0] || ""}${s.lastName?.[0] || ""}`.toUpperCase();
  const AVATAR_COLORS = ["bg-[#0891b2]","bg-[#7c3aed]","bg-[#059669]","bg-[#d97706]","bg-[#dc2626]","bg-[#0284c7]"];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] flex items-center gap-2"><UserCheck className="w-5 h-5 text-[#0891b2]" />Staff</h1>
          <p className="text-sm text-[#64748b] mt-0.5">{staff.filter(s => s.status === "Active").length} active · {staff.length} total</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-lg"><Plus className="w-4 h-4" />Add Staff</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Staff", value: staff.length, color: "text-[#0891b2]" },
          { label: "Active", value: staff.filter(s => s.status === "Active").length, color: "text-[#059669]" },
          { label: "On Leave", value: staff.filter(s => s.status === "On Leave").length, color: "text-[#d97706]" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 shadow-sm">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff by name or role…"
          className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-[#f8fafc]" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-3 py-12 text-center text-sm text-[#94a3b8]">Loading…</div>
          : filtered.length === 0 ? (
            <div className="col-span-3 bg-white border border-[#e2e8f0] rounded-xl py-16 text-center shadow-sm">
              <UserCheck className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
              <p className="text-sm text-[#94a3b8]">No staff found</p>
              <button onClick={openCreate} className="mt-3 px-4 py-2 bg-[#0891b2] text-white text-sm rounded-lg">Add First Staff Member</button>
            </div>
          ) : filtered.map((s, i) => (
            <div key={s.id} className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden hover:border-[#0891b2] transition-colors">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                      {getInitials(s)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1e293b]">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-[#64748b]">{s.role}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${STATUS_STYLES[s.status] || "bg-[#f1f5f9] text-[#475569]"}`}>{s.status}</span>
                </div>
                <div className="space-y-1">
                  {s.phone && <p className="flex items-center gap-2 text-xs text-[#64748b]"><Phone className="w-3 h-3" />{s.phone}</p>}
                  {s.email && <p className="flex items-center gap-2 text-xs text-[#64748b] truncate"><Mail className="w-3 h-3" />{s.email}</p>}
                  {s.hourlyRate && <p className="flex items-center gap-2 text-xs text-[#059669] font-semibold"><Star className="w-3 h-3" />R{s.hourlyRate}/hr</p>}
                </div>
              </div>
              <div className="border-t border-[#f1f5f9] px-4 py-2.5 flex justify-end gap-2 bg-[#f8fafc]">
                <button onClick={() => openEdit(s)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#e2e8f0] rounded-lg"><Edit2 className="w-3 h-3" />Edit</button>
                <button onClick={() => handleDelete(s.id)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#dc2626] hover:bg-[#fef2f2] rounded-lg"><Trash2 className="w-3 h-3" />Remove</button>
              </div>
            </div>
          ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">{editItem ? "Edit Staff Member" : "Add Staff Member"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#94a3b8] hover:bg-[#e2e8f0] rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[["First Name *", "firstName", "Jane"], ["Last Name *", "lastName", "Smith"]].map(([l, k, p]) => (
                  <div key={k}>
                    <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">{l}</label>
                    <input value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={p}
                      className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                  </div>
                ))}
              </div>
              {[["Phone", "phone", "+27 82 000 0000"], ["Email", "email", "jane@email.com"], ["ID Number", "idNumber", "8501015800086"], ["Address", "address", "123 Main St, Johannesburg"]].map(([l, k, p]) => (
                <div key={k}>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">{l}</label>
                  <input value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={p}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                    {STATUS_OPT.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Hourly Rate (R)</label>
                  <input type="number" value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[["Emergency Contact", "emergencyContact", "John Smith"], ["Emergency Phone", "emergencyPhone", "+27 82 000 0000"]].map(([l, k, p]) => (
                  <div key={k}>
                    <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">{l}</label>
                    <input value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={p}
                      className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Certifications, special skills, etc."
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e2e8f0]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc]">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] text-white text-sm font-medium rounded-lg disabled:opacity-50">
                <Save className="w-4 h-4" />{saving ? "Saving…" : "Save Staff"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}