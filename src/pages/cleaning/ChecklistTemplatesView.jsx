import React, { useState, useEffect } from "react";
import { LayoutTemplate, Plus, X, Save, Edit2, Trash2, Copy, Circle } from "lucide-react";
import { db } from "../../firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";

const DEFAULT_TEMPLATES = [
  { name: "Standard Residential Clean", serviceType: "Standard Cleaning", items: ["Vacuum all carpets and rugs","Mop hard floors","Clean kitchen counters and surfaces","Clean stovetop and exterior of appliances","Wipe down cabinets","Clean bathroom sinks, toilets, and tubs","Clean mirrors","Dust furniture and fixtures","Empty all bins","Make beds and change linen if provided"] },
  { name: "Deep Clean", serviceType: "Deep Cleaning", items: ["All Standard Clean tasks","Clean inside oven","Clean inside fridge","Scrub grout in bathrooms","Wash windows (interior)","Clean light switches and door handles","Dust ceiling fans and vents","Clean inside cupboards","Sanitize all surfaces","Steam clean carpets"] },
  { name: "Office Clean", serviceType: "Office Cleaning", items: ["Vacuum carpets and mats","Mop hard floors","Empty all bins and replace liners","Wipe desks and workstations","Clean computer screens (exterior)","Sanitize keyboards and mice","Clean kitchen/break room","Clean bathrooms and restock supplies","Clean reception area","Dust blinds and sills"] },
  { name: "Move In/Out Clean", serviceType: "Move In/Out", items: ["Deep clean all rooms","Clean inside all cupboards and drawers","Clean all appliances inside and out","Wash all windows interior","Clean garage if applicable","Steam clean carpets","Scrub all bathrooms","Clean all light fittings","Wipe all walls and skirtings","Final walkthrough inspection"] },
];

export default function ChecklistTemplatesView({ user }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", serviceType: "Standard Cleaning", items: [] });
  const [newItemText, setNewItemText] = useState("");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({});

  useEffect(() => { load(); }, [user]);

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const q = query(collection(db, "users", user.uid, "checklistTemplates"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const seedDefaults = async () => {
    if (!window.confirm("This will add the default cleaning templates to your library. Continue?")) return;
    for (const t of DEFAULT_TEMPLATES) {
      await addDoc(collection(db, "users", user.uid, "checklistTemplates"), {
        ...t, items: t.items.map((text, i) => ({ id: i + 1, text })), createdAt: serverTimestamp()
      });
    }
    load();
  };

  const openCreate = () => { setEditItem(null); setForm({ name: "", serviceType: "Standard Cleaning", items: [] }); setShowModal(true); };
  const openEdit = (t) => { setEditItem(t); setForm({ ...t }); setShowModal(true); };

  const addItem = () => {
    if (!newItemText.trim()) return;
    setForm(f => ({ ...f, items: [...f.items, { text: newItemText.trim(), id: Date.now() }] }));
    setNewItemText("");
  };

  const removeItem = (id) => setForm(f => ({ ...f, items: f.items.filter(i => i.id !== id) }));

  const handleSave = async () => {
    if (!form.name) return alert("Template name required");
    setSaving(true);
    try {
      const data = { ...form, updatedAt: serverTimestamp() };
      if (editItem) await updateDoc(doc(db, "users", user.uid, "checklistTemplates", editItem.id), data);
      else await addDoc(collection(db, "users", user.uid, "checklistTemplates"), { ...data, createdAt: serverTimestamp() });
      setShowModal(false); load();
    } catch (e) { alert("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDuplicate = async (t) => {
    await addDoc(collection(db, "users", user.uid, "checklistTemplates"), {
      ...t, id: undefined, name: `${t.name} (Copy)`, createdAt: serverTimestamp()
    });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    await deleteDoc(doc(db, "users", user.uid, "checklistTemplates", id)); load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] flex items-center gap-2"><LayoutTemplate className="w-5 h-5 text-[#0891b2]" />Checklist Templates</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Reusable task lists for each service type</p>
        </div>
        <div className="flex gap-2">
          {templates.length === 0 && (
            <button onClick={seedDefaults} className="px-3 py-2 text-sm font-medium bg-[#f0fdf4] text-[#059669] border border-[#bbf7d0] rounded-lg hover:bg-[#dcfce7]">
              Load Defaults
            </button>
          )}
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-lg">
            <Plus className="w-4 h-4" />New Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? <div className="col-span-2 py-12 text-center text-sm text-[#94a3b8]">Loading…</div>
          : templates.length === 0 ? (
            <div className="col-span-2 bg-white border border-[#e2e8f0] rounded-xl py-16 text-center shadow-sm">
              <LayoutTemplate className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
              <p className="text-sm text-[#94a3b8] mb-2">No templates yet</p>
              <div className="flex justify-center gap-2">
                <button onClick={seedDefaults} className="px-4 py-2 bg-[#f0fdf4] text-[#059669] border border-[#bbf7d0] text-sm rounded-lg">Load Defaults</button>
                <button onClick={openCreate} className="px-4 py-2 bg-[#0891b2] text-white text-sm rounded-lg">Create Custom</button>
              </div>
            </div>
          ) : templates.map(t => (
            <div key={t.id} className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1e293b]">{t.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-[#ecfeff] text-[#0e7490] px-2 py-0.5 rounded border border-[#a5f3fc]">{t.serviceType}</span>
                    <span className="text-xs text-[#94a3b8]">{t.items?.length || 0} tasks</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleDuplicate(t)} className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#e2e8f0] rounded-lg" title="Duplicate"><Copy className="w-3.5 h-3.5" /></button>
                  <button onClick={() => openEdit(t)} className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#e2e8f0] rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="border-t border-[#f1f5f9] px-4 py-3 max-h-40 overflow-y-auto space-y-1">
                {(t.items || []).slice(0, 8).map((item, i) => (
                  <div key={item.id || i} className="flex items-center gap-2 text-sm text-[#64748b]">
                    <Circle className="w-3 h-3 text-[#cbd5e1] flex-shrink-0" />
                    {item.text}
                  </div>
                ))}
                {t.items?.length > 8 && <p className="text-xs text-[#94a3b8] pl-5">+{t.items.length - 8} more tasks</p>}
              </div>
            </div>
          ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">{editItem ? "Edit Template" : "New Template"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#94a3b8] hover:bg-[#e2e8f0] rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Template Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Standard Residential Clean"
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Service Type</label>
                <select value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                  {["Standard Cleaning","Deep Cleaning","Move In/Out","Office Cleaning","Carpet Cleaning","Window Cleaning","Specialized"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-2">Tasks ({form.items.length})</label>
                <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto">
                  {form.items.map((item, i) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                      <span className="text-xs text-[#94a3b8] w-5 text-right flex-shrink-0">{i + 1}</span>
                      <span className="text-sm text-[#374151] flex-1">{item.text}</span>
                      <button onClick={() => removeItem(item.id)} className="p-0.5 text-[#dc2626] hover:bg-[#fef2f2] rounded"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newItemText} onChange={e => setNewItemText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addItem()}
                    placeholder="Add task (press Enter)"
                    className="flex-1 px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                  <button onClick={addItem} className="px-3 py-2 bg-[#0891b2] text-white text-sm rounded-md hover:bg-[#0e7490]"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e2e8f0]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc]">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] text-white text-sm font-medium rounded-lg disabled:opacity-50">
                <Save className="w-4 h-4" />{saving ? "Saving…" : "Save Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}