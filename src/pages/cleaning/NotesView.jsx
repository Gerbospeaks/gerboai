import { useState, useEffect, useRef } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  StickyNote,
  Search,
  ChevronDown,
  Pin,
  PinOff,
  Pencil,
  Trash2,
  Plus,
  FileText,
  Receipt,
  X,
  Check,
  Loader2,
  InboxIcon,
  AlertCircle,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const initials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const formatTs = (ts) => {
  if (!ts) return "—";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ── Job Picker ────────────────────────────────────────────────────────────────
function JobPicker({ jobs, selected, onSelect, loading }) {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState("");
  const ref                   = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    return (
      j.quoteNumber?.toLowerCase().includes(q) ||
      j.customer?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div ref={ref} className="relative w-full">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border-2 border-[#e2e8f0] hover:border-[#0891b2] rounded-xl text-sm font-medium text-[#1e293b] transition-colors shadow-sm"
      >
        <div className="flex items-center gap-3 min-w-0">
          {loading ? (
            <Loader2 className="w-4 h-4 text-[#94a3b8] animate-spin flex-shrink-0" />
          ) : selected ? (
            selected.documentType === "invoice"
              ? <Receipt className="w-4 h-4 text-[#7c3aed] flex-shrink-0" />
              : <FileText className="w-4 h-4 text-[#0891b2] flex-shrink-0" />
          ) : (
            <Search className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
          )}
          <span className="truncate">
            {loading
              ? "Loading jobs…"
              : selected
                ? `${selected.quoteNumber} — ${selected.customer?.name || "Unknown"}`
                : "Select a quote or invoice…"}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-[#94a3b8] flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white border border-[#e2e8f0] rounded-xl shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-[#f1f5f9]">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
              <Search className="w-3.5 h-3.5 text-[#94a3b8] flex-shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by number or client…"
                className="flex-1 bg-transparent text-sm text-[#1e293b] placeholder-[#94a3b8] outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-[#94a3b8] hover:text-[#374151]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#94a3b8]">
                No jobs match "{search}"
              </div>
            ) : (
              filtered.map((j) => (
                <button
                  key={j.id}
                  onClick={() => { onSelect(j); setOpen(false); setSearch(""); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f8fafc] transition-colors border-b border-[#f1f5f9] last:border-0 ${
                    selected?.id === j.id ? "bg-[#ecfeff]" : ""
                  }`}
                >
                  {/* Type badge */}
                  <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    j.documentType === "invoice"
                      ? "bg-[#f3e8ff] text-[#7c3aed]"
                      : "bg-[#e0f2fe] text-[#0369a1]"
                  }`}>
                    {j.documentType === "invoice"
                      ? <Receipt className="w-2.5 h-2.5" />
                      : <FileText className="w-2.5 h-2.5" />}
                    {j.documentType}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#0891b2] truncate">{j.quoteNumber}</span>
                      <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        j.status === "paid"         ? "bg-[#dcfce7] text-[#166534]"
                        : j.status === "converted"  ? "bg-[#e0e7ff] text-[#3730a3]"
                        : "bg-[#fef3c7] text-[#92400e]"
                      }`}>
                        {j.status || "pending"}
                      </span>
                    </div>
                    <span className="text-xs text-[#64748b] truncate block">{j.customer?.name || "—"}</span>
                  </div>

                  {selected?.id === j.id && <Check className="w-4 h-4 text-[#0891b2] flex-shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Note Card ─────────────────────────────────────────────────────────────────
function NoteCard({ note, onPin, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className={`group bg-white rounded-xl border transition-all duration-200 hover:shadow-md ${
        note.pinned
          ? "border-l-4 border-l-[#f59e0b] border-[#fde68a] shadow-sm"
          : "border-[#e2e8f0]"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0891b2] to-[#0e7490] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials(note.user)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1e293b] truncate">{note.user}</p>
            <p className="text-[11px] text-[#94a3b8]">{note.timestamp}</p>
          </div>
          {note.pinned && (
            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-[#fef3c7] text-[#92400e] rounded-full text-[10px] font-bold">
              <Pin className="w-2.5 h-2.5" /> Pinned
            </span>
          )}
          {note.editedAt && (
            <span className="flex-shrink-0 text-[10px] text-[#94a3b8] italic">edited</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onPin(note.id, note.pinned)}
            title={note.pinned ? "Unpin" : "Pin"}
            className="p-1.5 text-[#94a3b8] hover:text-[#f59e0b] hover:bg-[#fef9c3] rounded-lg transition-colors"
          >
            {note.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onEdit(note)}
            title="Edit"
            className="p-1.5 text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(note.id)}
                className="px-2 py-1 bg-[#dc2626] text-white text-xs font-medium rounded-lg hover:bg-[#b91c1c] transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              title="Delete"
              className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-4">
        <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">{note.content}</p>
      </div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ note, onSave, onClose }) {
  const [content, setContent] = useState(note.content);
  const saving = false;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-[#0891b2]" />
            <span className="font-semibold text-[#1e293b] text-sm">Edit Note</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none leading-relaxed"
            rows={6}
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(note.id, content)}
              disabled={!content.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0891b2] hover:bg-[#0e7490] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const NotesView = ({ user }) => {
  const userId = user?.uid || auth.currentUser?.uid;

  // Jobs state
  const [jobs,         setJobs]         = useState([]);
  const [jobsLoading,  setJobsLoading]  = useState(true);
  const [selectedJob,  setSelectedJob]  = useState(null);

  // Notes state
  const [notes,        setNotes]        = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError,   setNotesError]   = useState(null);

  // Input state
  const [newNote,      setNewNote]      = useState("");
  const [adding,       setAdding]       = useState(false);
  const [editingNote,  setEditingNote]  = useState(null);

  // ── Load all quotes + invoices as job list ──────────────────────────────
  useEffect(() => {
    if (!userId) { setJobsLoading(false); return; }

    const loadJobs = async () => {
      setJobsLoading(true);
      try {
        const [quotesSnap, invoicesSnap] = await Promise.all([
          getDocs(query(collection(db, "users", userId, "quotes"),   orderBy("createdAt", "desc"))),
          getDocs(query(collection(db, "users", userId, "invoices"), orderBy("createdAt", "desc"))),
        ]);
        const quotes   = quotesSnap.docs.map((d)   => ({ id: d.id, ...d.data() }));
        const invoices = invoicesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Merge and sort by creation time descending
        const merged = [...quotes, ...invoices].sort((a, b) => {
          const ta = a.createdAt?.seconds || 0;
          const tb = b.createdAt?.seconds || 0;
          return tb - ta;
        });
        setJobs(merged);
      } catch (e) {
        console.error("Failed to load jobs:", e);
      } finally {
        setJobsLoading(false);
      }
    };

    loadJobs();
  }, [userId]);

  // ── Real-time notes listener for selected job ───────────────────────────
  useEffect(() => {
    if (!userId || !selectedJob) { setNotes([]); return; }

    setNotesLoading(true);
    setNotesError(null);

    // Path: users/{uid}/quotes/{jobId}/notes  OR  users/{uid}/invoices/{jobId}/notes
    const col    = selectedJob.documentType === "invoice" ? "invoices" : "quotes";
    const notesRef = collection(db, "users", userId, col, selectedJob.id, "notes");
    const q      = query(notesRef, orderBy("timestamp", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setNotes(snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          // Keep raw timestamp for sorting; also a formatted string for display
          timestamp: formatTs(d.data().timestamp),
          _ts: d.data().timestamp?.seconds || 0,
        })));
        setNotesLoading(false);
      },
      (err) => {
        console.error("Notes listener error:", err);
        setNotesError("Failed to load notes. Please try again.");
        setNotesLoading(false);
      },
    );

    return () => unsub();
  }, [userId, selectedJob]);

  // ── Sorted notes: pinned first ──────────────────────────────────────────
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return (b._ts || 0) - (a._ts || 0);
  });

  // ── Helpers for path ────────────────────────────────────────────────────
  const noteDocRef = (noteId) => {
    const col = selectedJob.documentType === "invoice" ? "invoices" : "quotes";
    return doc(db, "users", userId, col, selectedJob.id, "notes", noteId);
  };

  const noteColRef = () => {
    const col = selectedJob.documentType === "invoice" ? "invoices" : "quotes";
    return collection(db, "users", userId, col, selectedJob.id, "notes");
  };

  // ── CRUD ────────────────────────────────────────────────────────────────
  const handleAddNote = async () => {
    if (!newNote.trim() || !userId || !selectedJob) return;
    setAdding(true);
    try {
      await addDoc(noteColRef(), {
        timestamp: serverTimestamp(),
        user:
          auth.currentUser?.displayName ||
          auth.currentUser?.email ||
          user?.displayName ||
          user?.email ||
          "User",
        content:  newNote.trim(),
        pinned:   false,
      });
      setNewNote("");
    } catch (e) {
      console.error("Add note error:", e);
      alert("Failed to add note. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try { await deleteDoc(noteDocRef(noteId)); }
    catch (e) { console.error("Delete note error:", e); alert("Failed to delete note."); }
  };

  const handlePinNote = async (noteId, currentPinned) => {
    try { await updateDoc(noteDocRef(noteId), { pinned: !currentPinned }); }
    catch (e) { console.error("Pin note error:", e); }
  };

  const handleSaveEdit = async (noteId, content) => {
    if (!content.trim()) return;
    try {
      await updateDoc(noteDocRef(noteId), { content: content.trim(), editedAt: serverTimestamp() });
      setEditingNote(null);
    } catch (e) {
      console.error("Edit note error:", e);
      alert("Failed to update note.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAddNote();
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-[#f8fafc] min-h-0">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-[#e2e8f0] px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-[#ecfeff] rounded-xl flex items-center justify-center">
              <StickyNote className="w-5 h-5 text-[#0891b2]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0f172a]">Job Notes</h1>
              <p className="text-xs text-[#64748b]">
                {jobs.length > 0
                  ? `${jobs.length} job${jobs.length !== 1 ? "s" : ""} available`
                  : "Add notes to any quote or invoice"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrollable body ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">

          {/* ── Job Picker card ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f1f5f9] bg-[#f8fafc]">
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                Select Job
              </p>
            </div>
            <div className="p-4">
              <JobPicker
                jobs={jobs}
                selected={selectedJob}
                onSelect={setSelectedJob}
                loading={jobsLoading}
              />

              {/* Selected job summary strip */}
              {selectedJob && (
                <div className="mt-3 flex flex-wrap items-center gap-3 px-4 py-3 bg-[#f0f9ff] border border-[#bae6fd] rounded-xl text-xs">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold uppercase ${
                    selectedJob.documentType === "invoice"
                      ? "bg-[#f3e8ff] text-[#7c3aed]"
                      : "bg-[#e0f2fe] text-[#0369a1]"
                  }`}>
                    {selectedJob.documentType === "invoice"
                      ? <Receipt className="w-3 h-3" />
                      : <FileText className="w-3 h-3" />}
                    {selectedJob.documentType}
                  </span>
                  <span className="font-bold text-[#0891b2]">{selectedJob.quoteNumber}</span>
                  <span className="text-[#334155]">{selectedJob.customer?.name}</span>
                  <span className="text-[#64748b]">{selectedJob.customer?.address}</span>
                  <span className="ml-auto font-bold text-[#0f172a]">
                    R{Number(selectedJob.totals?.total || 0).toFixed(2)}
                  </span>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="p-0.5 text-[#94a3b8] hover:text-[#64748b] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── No job selected placeholder ─────────────────────────────── */}
          {!selectedJob && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-[#f1f5f9] rounded-2xl flex items-center justify-center mb-4">
                <StickyNote className="w-8 h-8 text-[#cbd5e1]" />
              </div>
              <p className="text-sm font-semibold text-[#94a3b8]">No job selected</p>
              <p className="text-xs text-[#cbd5e1] mt-1">
                {jobsLoading
                  ? "Loading your quotes and invoices…"
                  : jobs.length === 0
                    ? "Create a quote or invoice first to add notes"
                    : "Pick a quote or invoice above to view and add notes"}
              </p>
            </div>
          )}

          {/* ── Notes area (visible only when job selected) ─────────────── */}
          {selectedJob && (
            <>
              {/* ── Add note input ─────────────────────────────────────── */}
              <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#f1f5f9] bg-[#f8fafc] flex items-center justify-between">
                  <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">New Note</p>
                  <span className="text-[10px] text-[#94a3b8]">Ctrl + Enter to submit</span>
                </div>
                <div className="p-4">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a note about this job…"
                    rows={3}
                    className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-xl text-sm text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0891b2] focus:border-[#0891b2] resize-none leading-relaxed transition-colors"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-[#94a3b8]">
                      {newNote.length > 0 ? `${newNote.length} characters` : ""}
                    </span>
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || adding}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] hover:bg-[#0e7490] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      {adding
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Plus className="w-3.5 h-3.5" />}
                      Add Note
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Notes list ─────────────────────────────────────────── */}
              <div>
                {/* List header */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                    Notes
                    {notes.length > 0 && (
                      <span className="ml-2 bg-[#e2e8f0] text-[#475569] px-2 py-0.5 rounded-full normal-case tracking-normal font-bold text-[10px]">
                        {notes.length}
                      </span>
                    )}
                  </p>
                  {notes.filter((n) => n.pinned).length > 0 && (
                    <span className="text-[10px] text-[#f59e0b] font-semibold flex items-center gap-1">
                      <Pin className="w-3 h-3" />
                      {notes.filter((n) => n.pinned).length} pinned
                    </span>
                  )}
                </div>

                {/* Loading */}
                {notesLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-[#0891b2] animate-spin" />
                  </div>
                )}

                {/* Error */}
                {notesError && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#fef2f2] border border-[#fecaca] rounded-xl text-sm text-[#dc2626]">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {notesError}
                  </div>
                )}

                {/* Empty */}
                {!notesLoading && !notesError && notes.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border-2 border-dashed border-[#e2e8f0]">
                    <InboxIcon className="w-8 h-8 text-[#cbd5e1] mb-3" />
                    <p className="text-sm font-medium text-[#94a3b8]">No notes yet</p>
                    <p className="text-xs text-[#cbd5e1] mt-1">Add your first note for this job above</p>
                  </div>
                )}

                {/* Cards */}
                {!notesLoading && sortedNotes.length > 0 && (
                  <div className="space-y-3">
                    {sortedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onPin={handlePinNote}
                        onEdit={setEditingNote}
                        onDelete={handleDeleteNote}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Edit modal ───────────────────────────────────────────────────── */}
      {editingNote && (
        <EditModal
          note={editingNote}
          onSave={handleSaveEdit}
          onClose={() => setEditingNote(null)}
        />
      )}
    </div>
  );
};

export default NotesView;