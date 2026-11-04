import React, { useState, useEffect, useMemo } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { Search, Edit2, Trash2, Loader2, StickyNote } from "lucide-react";

// Notes are standalone by default (users/{uid}/notes). If a jobCardId is
// passed, they attach to that job card instead (users/{uid}/jobcards/{id}/notes),
// so anything saved the old way is still reachable.

const CATEGORIES = [
  "General",
  "Measurements",
  "Customer",
  "Supplier & Orders",
  "Site & Safety",
];

const CAT_COLORS = {
  General: "bg-[#f1f5f9] text-[#475569]",
  Measurements: "bg-[#eff6ff] text-[#1d4ed8]",
  Customer: "bg-[#f0fdf4] text-[#166534]",
  "Supplier & Orders": "bg-[#faf5ff] text-[#7c3aed]",
  "Site & Safety": "bg-[#fff7ed] text-[#c2410c]",
};

const PLACEHOLDERS = {
  General: "Add a note, reminder or observation…",
  Measurements: "e.g. Kitchen window 1200 x 900 mm, 6mm toughened, rebate 18mm",
  Customer: "e.g. Prefers morning fittings. Call before arriving.",
  "Supplier & Orders": "e.g. Laminated panes ordered, due Thursday",
  "Site & Safety":
    "e.g. Second-floor access via side gate. Wear gloves, broken glass.",
};

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]";

const formatWhen = (date) =>
  date
    ? date.toLocaleString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Just now";

const initials = (name) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const NotesView = ({ user, jobCardId }) => {
  const userId = user?.uid || auth.currentUser?.uid;
  const authorName =
    user?.name ||
    user?.displayName ||
    auth.currentUser?.displayName ||
    user?.email ||
    auth.currentUser?.email ||
    "Team member";

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const notesCol = () =>
    jobCardId
      ? collection(db, "users", userId, "jobcards", jobCardId, "notes")
      : collection(db, "users", userId, "notes");
  const noteDoc = (id) =>
    jobCardId
      ? doc(db, "users", userId, "jobcards", jobCardId, "notes", id)
      : doc(db, "users", userId, "notes", id);

  // ── Live notes ────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) {
      // Not signed in yet: show the empty state instead of spinning forever
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = onSnapshot(
      query(notesCol(), orderBy("timestamp", "desc")),
      (snapshot) => {
        setNotes(
          snapshot.docs.map((d) => {
            // "estimate" gives a note you just saved a time straight away
            const data = d.data({ serverTimestamps: "estimate" });
            return {
              id: d.id,
              ...data,
              date: data.timestamp?.toDate?.() || null,
              editedDate: data.editedAt?.toDate?.() || null,
            };
          }),
        );
        setError("");
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching notes:", err);
        setError(
          "Could not load your notes. Check your connection and refresh.",
        );
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, [userId, jobCardId]);

  // ── Actions ───────────────────────────────────────────────────────
  const handleAddNote = async () => {
    if (!newNote.trim() || !userId || adding) return;
    setAdding(true);
    try {
      await addDoc(notesCol(), {
        timestamp: serverTimestamp(),
        user: authorName,
        content: newNote.trim(),
        category: newCategory,
        pinned: false,
      });
      setNewNote("");
      setError("");
    } catch (err) {
      console.error("Error adding note:", err);
      setError("Could not add your note. Try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await deleteDoc(noteDoc(id));
    } catch (err) {
      console.error("Error deleting note:", err);
      setError("Could not delete the note. Try again.");
    }
  };

  const handlePinNote = async (id, pinned) => {
    try {
      await updateDoc(noteDoc(id), { pinned: !pinned });
    } catch (err) {
      console.error("Error pinning note:", err);
      setError("Could not update the note. Try again.");
    }
  };

  const startEdit = (note) => {
    setEditingId(note.id);
    setEditContent(note.content || "");
  };

  const handleSaveEdit = async (id) => {
    if (!editContent.trim()) return;
    try {
      await updateDoc(noteDoc(id), {
        content: editContent.trim(),
        editedAt: serverTimestamp(),
      });
      setEditingId(null);
      setEditContent("");
    } catch (err) {
      console.error("Error updating note:", err);
      setError("Could not save your changes. Try again.");
    }
  };

  // ── Derived ───────────────────────────────────────────────────────
  const visibleNotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return notes
      .filter(
        (n) =>
          (filter === "All" || (n.category || "General") === filter) &&
          (!term ||
            n.content?.toLowerCase().includes(term) ||
            n.user?.toLowerCase().includes(term)),
      )
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (b.date?.getTime() || 0) - (a.date?.getTime() || 0);
      });
  }, [notes, search, filter]);

  // ── Render ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-[#64748b]">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading notes…</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-24 md:pb-6">
      <div>
        <h1 className="text-lg font-bold text-[#1e293b]">Notes</h1>
        <p className="text-xs text-[#64748b] mt-0.5">
          Measurements, customer details, supplier orders and site reminders
        </p>
      </div>

      {error && (
        <div className="bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* New note */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-4 space-y-3">
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setNewCategory(c)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                newCategory === c
                  ? "bg-[#2563eb] text-white shadow-sm"
                  : "bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#2563eb] hover:text-[#2563eb]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleAddNote();
          }}
          placeholder={PLACEHOLDERS[newCategory]}
          className={`${inputCls} min-h-24 resize-none`}
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#94a3b8] hidden sm:block">
            Ctrl + Enter to add
          </span>
          <button
            onClick={handleAddNote}
            disabled={!newNote.trim() || adding}
            className="ml-auto flex items-center gap-2 px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg shadow-sm disabled:bg-[#cbd5e1] disabled:text-[#64748b] disabled:shadow-none disabled:cursor-not-allowed transition-colors"
          >
            {adding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Add note
          </button>
        </div>
      </div>

      {/* Search + filter */}
      {notes.length > 0 && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {["All", ...CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  filter === c
                    ? "bg-[#1e293b] text-white"
                    : "bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#1e293b] hover:text-[#1e293b]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notes list */}
      <div className="space-y-3">
        {visibleNotes.map((note) => {
          const cat = note.category || "General";
          return (
            <div
              key={note.id}
              className={`bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow ${
                note.pinned ? "border-l-4 border-l-[#2563eb]" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-8 h-8 bg-[#dbeafe] text-[#1d4ed8] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {initials(note.user)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1e293b] truncate">
                      {note.user || "Team member"}
                    </p>
                    <p className="text-xs text-[#94a3b8]">
                      {formatWhen(note.date)}
                      {note.editedDate && " · edited"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {note.pinned && (
                    <span title="Pinned" className="text-sm">
                      📌
                    </span>
                  )}
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
                      CAT_COLORS[cat] || CAT_COLORS.General
                    }`}
                  >
                    {cat}
                  </span>
                </div>
              </div>

              {editingId === note.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className={`${inputCls} min-h-24 resize-none mb-2`}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(note.id)}
                      disabled={!editContent.trim()}
                      className="px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg disabled:opacity-60"
                    >
                      Save changes
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-1.5 text-sm font-medium text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg hover:bg-[#e2e8f0]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-[#374151] mb-3 whitespace-pre-wrap break-words">
                    {note.content}
                  </p>
                  <div className="flex gap-1 -ml-2">
                    <button
                      onClick={() => handlePinNote(note.id, note.pinned)}
                      className="px-2 py-1 text-xs text-[#64748b] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-colors"
                    >
                      {note.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button
                      onClick={() => startEdit(note)}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-[#64748b] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {visibleNotes.length === 0 && (
        <div className="text-center py-14 bg-white border border-[#e2e8f0] rounded-xl">
          <StickyNote className="w-8 h-8 text-[#cbd5e1] mx-auto mb-2" />
          <p className="text-sm text-[#64748b]">
            {notes.length === 0
              ? "No notes yet. Write your first note above."
              : "No notes match your search or filter."}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotesView;
