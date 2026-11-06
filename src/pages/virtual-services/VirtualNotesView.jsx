import React, { useState, useEffect, useMemo } from "react";
import { addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { StickyNote, Plus, Search, Pin, PinOff, Pencil } from "lucide-react";
import {
  inputCls,
  labelCls,
  primaryBtn,
  ghostBtn,
  LoadingRow,
  PageHeader,
  Modal,
  EmptyState,
  userCol,
  fetchAll,
  seedCollection,
} from "./VirtualViewKit";

/**
 * VirtualNotesView – a standalone notes board for the whole workspace.
 *
 * The Upholstery NotesView hangs off a single job card (it needs a jobCardId
 * and renders nothing without one). A virtual business mostly takes notes
 * about *clients*, calls and ideas, so this one works on its own and can
 * optionally be tagged to a client or engagement.
 *
 * Firestore: users/{uid}/notes
 *   { title, body, tag, client, pinned, createdAt, updatedAt }
 */

const TAGS = ["General", "Client", "Call notes", "Idea", "Follow-up"];
const TAG_CLS = {
  General: "bg-[#f1f5f9] text-[#475569]",
  Client: "bg-[#ede9fe] text-[#6d28d9]",
  "Call notes": "bg-[#dbeafe] text-[#1d4ed8]",
  Idea: "bg-[#fef3c7] text-[#92400e]",
  "Follow-up": "bg-[#fee2e2] text-[#b91c1c]",
};

const BLANK = { title: "", body: "", tag: "General", client: "", pinned: false };

const SEED = [
  { title: "Brightside: brand direction", body: "Prefers calm blues and lots of white space. Wants booking form above the fold. Avoid stock photos of people.", tag: "Client", client: "Brightside Dental", pinned: true },
  { title: "Nova coaching: after session 3", body: "Delegation is the sticking point. Send the weekly delegation tracker before the next session.", tag: "Call notes", client: "Nova Logistics", pinned: false },
  { title: "Productise the SEO audit", body: "Fixed-price audit (R6k) as an entry offer into the retainer.", tag: "Idea", client: "", pinned: false },
];

const toDate = (t) => (t?.toDate ? t.toDate() : t instanceof Date ? t : null);
const fmtDate = (t) => {
  const d = toDate(t);
  return d ? d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "";
};

export default function VirtualNotesView({ user }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK);

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      setNotes(await fetchAll(userCol(user.uid, "notes")));
    } catch (e) {
      console.error("Notes load:", e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [user?.uid]);

  const loadSamples = async () => {
    setSeeding(true);
    try {
      await seedCollection(userCol(user.uid, "notes"), SEED);
      await load();
    } catch (e) {
      alert("Failed to load sample data.");
    } finally {
      setSeeding(false);
    }
  };

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notes
      .filter((n) => (tag === "All" ? true : n.tag === tag))
      .filter((n) => !q || [n.title, n.body, n.client].some((v) => (v || "").toLowerCase().includes(q)))
      .sort((a, b) => {
        if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
        const tb = (toDate(b.updatedAt) || toDate(b.createdAt) || 0).valueOf();
        const ta = (toDate(a.updatedAt) || toDate(a.createdAt) || 0).valueOf();
        return tb - ta;
      });
  }, [notes, search, tag]);

  const openAdd = () => {
    setForm(BLANK);
    setEditId(null);
    setShowModal(true);
  };
  const openEdit = (n) => {
    setForm({ ...BLANK, ...n });
    setEditId(n.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() && !form.body.trim()) return;
    setSaving(true);
    const payload = {
      title: form.title.trim() || "Untitled note",
      body: form.body,
      tag: form.tag,
      client: form.client.trim(),
      pinned: !!form.pinned,
    };
    try {
      if (editId) {
        await updateDoc(doc(db, "users", user.uid, "notes", editId), { ...payload, updatedAt: serverTimestamp() });
        setNotes((prev) => prev.map((n) => (n.id === editId ? { ...n, ...payload, updatedAt: new Date() } : n)));
      } else {
        const ref = await addDoc(userCol(user.uid, "notes"), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        setNotes((prev) => [...prev, { id: ref.id, ...payload, createdAt: new Date(), updatedAt: new Date() }]);
      }
      setShowModal(false);
    } catch (e) {
      console.error("Save note:", e);
      alert("Failed to save note.");
    } finally {
      setSaving(false);
    }
  };

  const togglePin = async (n) => {
    try {
      await updateDoc(doc(db, "users", user.uid, "notes", n.id), { pinned: !n.pinned });
      setNotes((prev) => prev.map((x) => (x.id === n.id ? { ...x, pinned: !n.pinned } : x)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!editId || !window.confirm("Delete this note?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "notes", editId));
      setNotes((prev) => prev.filter((n) => n.id !== editId));
      setShowModal(false);
    } catch (e) {
      alert("Failed to delete note.");
    }
  };

  if (loading) return <LoadingRow label="Loading notes…" />;

  return (
    <div className="space-y-5">
      <PageHeader title="Notes" subtitle="Client context, call notes and ideas in one place">
        <button onClick={openAdd} className={primaryBtn}>
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </PageHeader>

      {notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No notes yet"
          hint="Capture client preferences, call summaries and follow-ups."
          onAdd={openAdd}
          addLabel="New Note"
          onSeed={loadSamples}
          seeding={seeding}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex gap-1 overflow-x-auto">
              {["All", ...TAGS].map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${tag === t ? "bg-[#7c3aed] text-white" : "bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="relative sm:w-64">
              <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input className={`${inputCls} pl-9`} placeholder="Search notes" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {shown.length === 0 ? (
            <p className="text-center text-sm text-[#94a3b8] py-12">No notes match your filters</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {shown.map((n) => (
                <div key={n.id} className={`bg-white border rounded-xl shadow-sm p-4 flex flex-col hover:shadow-md transition-shadow ${n.pinned ? "border-[#c4b5fd]" : "border-[#e2e8f0]"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${TAG_CLS[n.tag] || TAG_CLS.General}`}>{n.tag}</span>
                      <h3 className="text-sm font-bold text-[#1e293b] mt-1.5 break-words">{n.title}</h3>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button onClick={() => togglePin(n)} title={n.pinned ? "Unpin" : "Pin"} className="p-1.5 text-[#94a3b8] hover:text-[#7c3aed] hover:bg-[#f5f3ff] rounded-lg">
                        {n.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => openEdit(n)} title="Edit" className="p-1.5 text-[#94a3b8] hover:text-[#7c3aed] hover:bg-[#f5f3ff] rounded-lg">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-[#475569] mt-2 whitespace-pre-wrap break-words flex-1">{n.body}</p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#f1f5f9] text-[11px] text-[#94a3b8]">
                    <span className="truncate">{n.client || "No client"}</span>
                    <span className="flex-shrink-0 ml-2">{fmtDate(n.updatedAt || n.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showModal && (
        <Modal
          wide
          title={editId ? "Edit Note" : "New Note"}
          onClose={() => setShowModal(false)}
          footer={
            <>
              {editId ? <button onClick={handleDelete} className="text-sm text-[#dc2626] hover:underline">Delete</button> : <span />}
              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)} className={ghostBtn}>Cancel</button>
                <button onClick={handleSave} disabled={saving || (!form.title.trim() && !form.body.trim())} className={primaryBtn}>{saving ? "Saving…" : "Save"}</button>
              </div>
            </>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Title</label>
              <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Tag</label>
              <select className={inputCls} value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}>
                {TAGS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Client (optional)</label>
              <input className={inputCls} value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Note</label>
              <textarea rows={7} className={inputCls} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </div>
            <label className="sm:col-span-2 flex items-center gap-2 text-sm text-[#374151]">
              <input type="checkbox" checked={!!form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} className="accent-[#7c3aed]" />
              Pin to top
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}
