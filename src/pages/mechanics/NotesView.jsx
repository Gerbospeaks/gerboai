import React, { useState, useEffect } from "react";
import {
  StickyNote,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit3,
  Check,
  X,
  Tag,
  Clock,
  AlertCircle,
  Wrench,
  Car,
  Users,
  Lightbulb,
  ChevronDown,
} from "lucide-react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

const CATEGORIES = [
  {
    id: "general",
    label: "General",
    color: "bg-[#64748b]",
    light: "bg-[#f1f5f9]",
    text: "text-[#374151]",
    icon: StickyNote,
  },
  {
    id: "workshop",
    label: "Workshop",
    color: "bg-[#2563eb]",
    light: "bg-[#eff6ff]",
    text: "text-[#1e40af]",
    icon: Wrench,
  },
  {
    id: "vehicle",
    label: "Vehicle",
    color: "bg-[#0284c7]",
    light: "bg-[#f0f9ff]",
    text: "text-[#0369a1]",
    icon: Car,
  },
  {
    id: "client",
    label: "Client",
    color: "bg-[#059669]",
    light: "bg-[#f0fdf4]",
    text: "text-[#166534]",
    icon: Users,
  },
  {
    id: "reminder",
    label: "Reminder",
    color: "bg-[#d97706]",
    light: "bg-[#fffbeb]",
    text: "text-[#92400e]",
    icon: AlertCircle,
  },
  {
    id: "idea",
    label: "Idea",
    color: "bg-[#7c3aed]",
    light: "bg-[#faf5ff]",
    text: "text-[#6b21a8]",
    icon: Lightbulb,
  },
];

const getCat = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

const formatDate = (val) => {
  if (!val) return "";
  if (val?.toDate)
    return val
      .toDate()
      .toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
  return new Date(val).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const BLANK = { title: "", body: "", category: "general", pinned: false };

export default function NotesView({ user }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (user?.uid) loadNotes();
  }, [user]);

  const loadNotes = async () => {
    setLoading(true);
    const db = getFirestore();
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "notes"),
          orderBy("createdAt", "desc"),
        ),
      );
      setNotes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const db = getFirestore();
    try {
      if (editingId) {
        await updateDoc(doc(db, "users", user.uid, "notes", editingId), {
          ...form,
          updatedAt: serverTimestamp(),
        });
        setNotes((prev) =>
          prev.map((n) => (n.id === editingId ? { ...n, ...form } : n)),
        );
      } else {
        const ref = await addDoc(collection(db, "users", user.uid, "notes"), {
          ...form,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setNotes((prev) => [
          { id: ref.id, ...form, createdAt: new Date() },
          ...prev,
        ]);
      }
      resetForm();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const db = getFirestore();
    try {
      await deleteDoc(doc(db, "users", user.uid, "notes", id));
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setDeleteConfirm(null);
    } catch (e) {
      console.error(e);
    }
  };

  const togglePin = async (note) => {
    const db = getFirestore();
    const updated = { ...note, pinned: !note.pinned };
    try {
      await updateDoc(doc(db, "users", user.uid, "notes", note.id), {
        pinned: updated.pinned,
      });
      setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)));
    } catch (e) {}
  };

  const startEdit = (note) => {
    setEditingId(note.id);
    setForm({
      title: note.title,
      body: note.body,
      category: note.category,
      pinned: note.pinned,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(BLANK);
    setEditingId(null);
    setShowForm(false);
  };

  const filtered = notes
    .filter((n) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        n.title?.toLowerCase().includes(q) ||
        n.body?.toLowerCase().includes(q);
      const matchCat = filterCat === "all" || n.category === filterCat;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

  const pinned = filtered.filter((n) => n.pinned);
  const unpinned = filtered.filter((n) => !n.pinned);

  const NoteCard = ({ note }) => {
    const cat = getCat(note.category);
    const CatIcon = cat.icon;
    return (
      <div
        className={`relative bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm hover:shadow-md transition-all group ${note.pinned ? "ring-1 ring-[#2563eb]/20" : ""}`}
      >
        {note.pinned && (
          <div className="absolute top-3 right-3">
            <Pin className="w-3.5 h-3.5 text-[#2563eb] fill-[#2563eb]" />
          </div>
        )}

        {/* Category badge */}
        <div
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide mb-3 ${cat.light} ${cat.text}`}
        >
          <CatIcon className="w-3 h-3" />
          {cat.label}
        </div>

        <h3 className="text-sm font-semibold text-[#1e293b] mb-1.5 pr-5 line-clamp-1">
          {note.title}
        </h3>
        {note.body && (
          <p className="text-xs text-[#64748b] leading-relaxed line-clamp-3 mb-3">
            {note.body}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-[#94a3b8]">
            <Clock className="w-3 h-3" />
            {formatDate(note.createdAt)}
          </span>

          {/* Actions — visible on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => togglePin(note)}
              title={note.pinned ? "Unpin" : "Pin"}
              className={`p-1.5 rounded-lg transition-colors ${note.pinned ? "text-[#2563eb] hover:bg-[#eff6ff]" : "text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff]"}`}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => startEdit(note)}
              className="p-1.5 text-[#94a3b8] hover:text-[#1e293b] hover:bg-[#f1f5f9] rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeleteConfirm(note.id)}
              className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Delete confirm inline */}
        {deleteConfirm === note.id && (
          <div className="mt-3 pt-3 border-t border-[#e2e8f0] flex items-center justify-between">
            <span className="text-xs text-[#dc2626] font-medium">
              Delete this note?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-2 py-1 text-xs text-[#64748b] hover:text-[#1e293b] bg-[#f1f5f9] rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(note.id)}
                className="px-2 py-1 text-xs text-white bg-[#dc2626] hover:bg-[#b91c1c] rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#faf5ff] rounded-xl flex items-center justify-center">
            <StickyNote className="w-5 h-5 text-[#7c3aed]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1e293b]">Notes</h1>
            <p className="text-xs text-[#64748b]">
              {notes.length} workshop notes
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
            <span className="text-sm font-semibold text-[#1e293b]">
              {editingId ? "Edit Note" : "New Note"}
            </span>
            <button
              onClick={resetForm}
              className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                Title *
              </label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Note title…"
                className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-[#1e293b]"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                Note
              </label>
              <textarea
                value={form.body}
                onChange={(e) =>
                  setForm((f) => ({ ...f, body: e.target.value }))
                }
                placeholder="Write your note here…"
                rows={4}
                className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-[#1e293b] resize-none"
              />
            </div>

            {/* Category + Pin row */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-[#1e293b]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 mt-5">
                <button
                  onClick={() => setForm((f) => ({ ...f, pinned: !f.pinned }))}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${form.pinned ? "bg-[#eff6ff] border-[#bfdbfe] text-[#2563eb]" : "bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#2563eb]"}`}
                >
                  <Pin className="w-4 h-4" />
                  {form.pinned ? "Pinned" : "Pin"}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={!form.title.trim() || saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                {saving ? "Saving…" : editingId ? "Update Note" : "Save Note"}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm text-[#64748b] hover:text-[#1e293b] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-[#1e293b] placeholder-[#94a3b8]"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterCat("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filterCat === "all" ? "bg-[#1e293b] text-white" : "bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#1e293b]"}`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCat(cat.id)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filterCat === cat.id ? `${cat.color} text-white` : `${cat.light} ${cat.text} hover:opacity-80`}`}
              >
                <Icon className="w-3 h-3" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#e2e8f0] rounded-xl p-4 space-y-3"
            >
              <div className="h-4 bg-[#f1f5f9] rounded animate-pulse w-20" />
              <div className="h-5 bg-[#f1f5f9] rounded animate-pulse w-3/4" />
              <div className="space-y-2">
                <div className="h-3 bg-[#f1f5f9] rounded animate-pulse" />
                <div className="h-3 bg-[#f1f5f9] rounded animate-pulse w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#e2e8f0] rounded-xl text-center">
          <div className="w-14 h-14 bg-[#faf5ff] rounded-full flex items-center justify-center mb-4">
            <StickyNote className="w-7 h-7 text-[#c4b5fd]" />
          </div>
          <p className="text-sm font-semibold text-[#374151]">No notes yet</p>
          <p className="text-xs text-[#94a3b8] mt-1 mb-4">
            Create your first workshop note
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-xl transition-colors"
          >
            New Note
          </button>
        </div>
      ) : (
        <>
          {/* Pinned section */}
          {pinned.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Pin className="w-3 h-3" /> Pinned
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinned.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          )}

          {/* Other notes */}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-3">
                  Others
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unpinned.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
