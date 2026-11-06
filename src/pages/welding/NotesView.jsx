import { useState, useEffect, useMemo } from "react";
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
import { Pin, Pencil, Trash2, Search, StickyNote, Loader2 } from "lucide-react";

// Notes page.
//  - Standalone (dashboard):  users/{uid}/notes
//  - Scoped to a job card (optional jobCardId prop): users/{uid}/jobcards/{id}/notes
const NotesView = ({ user, jobCardId }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const userId = user?.uid || auth.currentUser?.uid;
  const authorName =
    user?.displayName ||
    user?.email ||
    auth.currentUser?.displayName ||
    auth.currentUser?.email ||
    "Current User";

  const notesCol = () =>
    jobCardId
      ? collection(db, "users", userId, "jobcards", jobCardId, "notes")
      : collection(db, "users", userId, "notes");
  const noteDoc = (id) =>
    jobCardId
      ? doc(db, "users", userId, "jobcards", jobCardId, "notes", id)
      : doc(db, "users", userId, "notes", id);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(notesCol(), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setNotes(
          snapshot.docs.map((d) => {
            // "estimate" avoids a null timestamp on a just-added note
            const data = d.data({ serverTimestamps: "estimate" });
            return {
              id: d.id,
              ...data,
              createdAt: data.timestamp?.toDate?.() || null,
            };
          }),
        );
        setError("");
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching notes:", err);
        setError("Could not load notes. Check your connection and try again.");
        setLoading(false);
      },
    );
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, jobCardId]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !userId || saving) return;
    setSaving(true);
    try {
      await addDoc(notesCol(), {
        timestamp: serverTimestamp(),
        user: authorName,
        content: newNote.trim(),
        pinned: false,
      });
      setNewNote("");
    } catch (err) {
      console.error("Error adding note:", err);
      alert("Failed to add note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!userId) return;
    if (!window.confirm("Delete this note?")) return;
    try {
      await deleteDoc(noteDoc(noteId));
    } catch (err) {
      console.error("Error deleting note:", err);
      alert("Failed to delete note. Please try again.");
    }
  };

  const handlePinNote = async (noteId, currentPinned) => {
    if (!userId) return;
    try {
      await updateDoc(noteDoc(noteId), { pinned: !currentPinned });
    } catch (err) {
      console.error("Error pinning note:", err);
      alert("Failed to update note. Please try again.");
    }
  };

  const handleEditNote = (id, content) => {
    setEditingId(id);
    setEditContent(content || "");
  };

  const handleSaveEdit = async (noteId) => {
    if (!userId || !editContent.trim()) return;
    try {
      await updateDoc(noteDoc(noteId), {
        content: editContent.trim(),
        editedAt: serverTimestamp(),
      });
      setEditingId(null);
      setEditContent("");
    } catch (err) {
      console.error("Error updating note:", err);
      alert("Failed to update note. Please try again.");
    }
  };

  const formatDate = (d) =>
    d
      ? d.toLocaleString("en-ZA", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  const initials = (name) =>
    (name || "?")
      .split(/[\s@]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("") || "?";

  // Pinned first, then newest first (the query already orders by newest)
  const visibleNotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? notes.filter(
          (n) =>
            (n.content || "").toLowerCase().includes(term) ||
            (n.user || "").toLowerCase().includes(term),
        )
      : notes;
    return [...filtered].sort(
      (a, b) => Number(!!b.pinned) - Number(!!a.pinned),
    );
  }, [notes, search]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-[#ea580c] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-[#1e293b] flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-[#ea580c]" />
          Notes
        </h2>
        <p className="text-sm text-[#64748b] mt-0.5">
          Jot down site observations, weld specs, customer requests and
          reminders
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* New note */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-4 mb-5">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleAddNote();
          }}
          placeholder="Add a new note…  (Ctrl/⌘ + Enter to save)"
          className="w-full p-3 text-sm border border-[#d1d5db] rounded-lg text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#ea580c] min-h-24 resize-none"
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handleAddNote}
            disabled={!newNote.trim() || saving}
            className="px-5 py-2 text-sm font-medium bg-[#ea580c] text-white rounded-lg hover:bg-[#c2410c] disabled:bg-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving…" : "Add Note"}
          </button>
        </div>
      </div>

      {/* Search */}
      {notes.length > 0 && (
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
          />
        </div>
      )}

      {/* Note list */}
      <div className="space-y-3">
        {visibleNotes.map((note) => (
          <div
            key={note.id}
            className={`bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow ${
              note.pinned ? "border-l-4 border-l-[#ea580c]" : ""
            }`}
          >
            <div className="flex items-start justify-between mb-2 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-8 h-8 bg-[#1e293b] text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {initials(note.user)}
                </span>
                <span className="font-semibold text-sm text-[#1e293b] truncate">
                  {note.user || "Unknown"}
                </span>
                {note.pinned && (
                  <Pin
                    className="w-3.5 h-3.5 text-[#ea580c] flex-shrink-0"
                    aria-label="Pinned"
                  />
                )}
              </div>
              <span className="text-xs text-[#94a3b8] whitespace-nowrap">
                {formatDate(note.createdAt)}
                {note.editedAt && " · edited"}
              </span>
            </div>

            {editingId === note.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 text-sm border border-[#d1d5db] rounded-lg text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#ea580c] min-h-24 resize-none mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(note.id)}
                    disabled={!editContent.trim()}
                    className="px-4 py-1.5 bg-[#ea580c] text-white rounded-lg hover:bg-[#c2410c] disabled:opacity-60 text-sm font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] rounded-lg hover:bg-[#f8fafc] text-sm font-medium"
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
                <div className="flex gap-4">
                  <button
                    onClick={() => handlePinNote(note.id, note.pinned)}
                    className="flex items-center gap-1 text-xs text-[#64748b] hover:text-[#ea580c] transition-colors"
                  >
                    <Pin className="w-3.5 h-3.5" />
                    {note.pinned ? "Unpin" : "Pin"}
                  </button>
                  <button
                    onClick={() => handleEditNote(note.id, note.content)}
                    className="flex items-center gap-1 text-xs text-[#64748b] hover:text-[#2563eb] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="flex items-center gap-1 text-xs text-[#64748b] hover:text-[#dc2626] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {notes.length === 0 && !error && (
        <div className="text-center py-12 bg-white border border-[#e2e8f0] rounded-xl shadow-sm">
          <StickyNote className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#64748b]">No notes yet</p>
          <p className="text-xs text-[#94a3b8] mt-1">
            Add your first note above to get started
          </p>
        </div>
      )}

      {notes.length > 0 && visibleNotes.length === 0 && (
        <p className="text-center text-sm text-[#94a3b8] py-8">
          No notes match “{search}”
        </p>
      )}
    </div>
  );
};

export default NotesView;
