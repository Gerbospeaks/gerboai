import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, X, Save, Edit2, Trash2, Check, Circle, ClipboardList } from "lucide-react";
import { db } from "../../firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";

export default function ChecklistsView({ user }) {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ jobName: "", address: "", date: "", items: [] });
  const [newItemText, setNewItemText] = useState("");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({});

  useEffect(() => { load(); }, [user]);

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const q = query(collection(db, "users", user.uid, "checklists"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setChecklists(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const addChecklistItem = () => {
    if (!newItemText.trim()) return;
    setForm(f => ({ ...f, items: [...f.items, { text: newItemText.trim(), done: false, id: Date.now() }] }));
    setNewItemText("");
  };

  const removeItem = (id) => setForm(f => ({ ...f, items: f.items.filter(i => i.id !== id) }));

  const handleSave = async () => {
    if (!form.jobName) return alert("Job name required");
    setSaving(true);
    try {
      const data = { ...form, updatedAt: serverTimestamp() };
      if (editItem) await updateDoc(doc(db, "users", user.uid, "checklists", editItem.id), data);
      else await addDoc(collection(db, "users", user.uid, "checklists"), { ...data, createdAt: serverTimestamp() });
      setShowModal(false); load();
    } catch (e) { alert("Failed to save"); }
    finally { setSaving(false); }
  };

  const toggleItem = async (checklist, itemId) => {
    const items = checklist.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i);
    await updateDoc(doc(db, "users", user.uid, "checklists", checklist.id), { items, updatedAt: serverTimestamp() });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this checklist?")) return;
    await deleteDoc(doc(db, "users", user.uid, "checklists", id)); load();
  };

  const openCreate = () => { setEditItem(null); setForm({ jobName: "", address: "", date: "", items: [] }); setShowModal(true); };
  const openEdit = (c) => { setEditItem(c); setForm({ ...c }); setShowModal(true); };
  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const getProgress = (items = []) => {
    if (!items.length) return 0;
    return Math.round((items.filter(i => i.done).length / items.length) * 100);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] flex items-center gap-2"><CheckSquare className="w-5 h-5 text-[#0891b2]" />Job Checklists</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Track cleaning tasks per job</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-lg">
          <Plus className="w-4 h-4" />New Checklist
        </button>
      </div>

      <div className="space-y-3">
        {loading ? <div className="text-center py-12 text-sm text-[#94a3b8]">Loading…</div>
          : checklists.length === 0 ? (
            <div className="bg-white border border-[#e2e8f0] rounded-xl py-16 text-center shadow-sm">
              <ClipboardList className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
              <p className="text-sm text-[#94a3b8]">No checklists yet</p>
              <button onClick={openCreate} className="mt-3 px-4 py-2 bg-[#0891b2] text-white text-sm rounded-lg">Create First</button>
            </div>
          ) : checklists.map(c => {
            const prog = getProgress(c.items);
            const isOpen = expanded[c.id];
            return (
              <div key={c.id} className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => toggleExpand(c.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-[#1e293b]">{c.jobName}</p>
                      {c.date && <span className="text-xs text-[#64748b]">{c.date}</span>}
                      <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded ${prog === 100 ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f1f5f9] text-[#475569]"}`}>{prog}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#0891b2] rounded-full transition-all" style={{ width: `${prog}%` }} />
                    </div>
                    <p className="text-xs text-[#94a3b8] mt-1">{c.items?.filter(i => i.done).length || 0} / {c.items?.length || 0} tasks complete</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); openEdit(c); }} className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#e2e8f0] rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(c.id); }} className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {isOpen && (
                  <div className="border-t border-[#f1f5f9] px-4 py-3 space-y-1.5">
                    {(c.items || []).map(item => (
                      <div key={item.id} onClick={() => toggleItem(c, item.id)}
                        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${item.done ? "bg-[#f0fdf4]" : "hover:bg-[#f8fafc]"}`}>
                        {item.done
                          ? <Check className="w-4 h-4 text-[#059669] flex-shrink-0" />
                          : <Circle className="w-4 h-4 text-[#cbd5e1] flex-shrink-0" />}
                        <span className={`text-sm ${item.done ? "line-through text-[#94a3b8]" : "text-[#374151]"}`}>{item.text}</span>
                      </div>
                    ))}
                    {(!c.items || c.items.length === 0) && <p className="text-xs text-[#94a3b8] py-2 text-center">No tasks added</p>}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">{editItem ? "Edit Checklist" : "New Checklist"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#94a3b8] hover:bg-[#e2e8f0] rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Job / Client Name *</label>
                <input value={form.jobName} onChange={e => setForm({ ...form, jobName: e.target.value })} placeholder="Johnson Residence — Deep Clean"
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Address</label>
                  <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Main St"
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                </div>
              </div>
              {/* Tasks */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Tasks</label>
                <div className="space-y-1.5 mb-3">
                  {form.items.map(item => (
                    <div key={item.id} className="flex items-center gap-2 p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                      <Circle className="w-3.5 h-3.5 text-[#cbd5e1] flex-shrink-0" />
                      <span className="text-sm text-[#374151] flex-1">{item.text}</span>
                      <button onClick={() => removeItem(item.id)} className="p-0.5 text-[#dc2626] hover:bg-[#fef2f2] rounded"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newItemText} onChange={e => setNewItemText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addChecklistItem()}
                    placeholder="Add task (e.g. Vacuum living room)"
                    className="flex-1 px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                  <button onClick={addChecklistItem} className="px-3 py-2 bg-[#0891b2] text-white text-sm rounded-md hover:bg-[#0e7490]">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e2e8f0]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc]">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] text-white text-sm font-medium rounded-lg disabled:opacity-50">
                <Save className="w-4 h-4" />{saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}