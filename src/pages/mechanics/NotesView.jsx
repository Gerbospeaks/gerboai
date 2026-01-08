import { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

// Notes View Component with Firebase
const NotesView = ({ jobCardId }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId || !jobCardId) return;

    // Reference to notes subcollection: users/{userId}/jobcards/{jobCardId}/notes
    const notesRef = collection(db, 'users', userId, 'jobcards', jobCardId, 'notes');
    const q = query(notesRef, orderBy('timestamp', 'desc'));

    // Real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) || 'N/A'
      }));
      setNotes(notesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notes:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, jobCardId]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !userId || !jobCardId) return;

    try {
      const notesRef = collection(db, 'users', userId, 'jobcards', jobCardId, 'notes');
      await addDoc(notesRef, {
        timestamp: serverTimestamp(),
        user: auth.currentUser?.displayName || auth.currentUser?.email || 'Current User',
        content: newNote,
        pinned: false
      });
      setNewNote("");
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note. Please try again.");
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!userId || !jobCardId) return;

    try {
      const noteRef = doc(db, 'users', userId, 'jobcards', jobCardId, 'notes', noteId);
      await deleteDoc(noteRef);
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note. Please try again.");
    }
  };

  const handlePinNote = async (noteId, currentPinned) => {
    if (!userId || !jobCardId) return;

    try {
      const noteRef = doc(db, 'users', userId, 'jobcards', jobCardId, 'notes', noteId);
      await updateDoc(noteRef, {
        pinned: !currentPinned
      });
    } catch (error) {
      console.error("Error pinning note:", error);
      alert("Failed to pin note. Please try again.");
    }
  };

  const handleEditNote = (id, content) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleSaveEdit = async (noteId) => {
    if (!userId || !jobCardId || !editContent.trim()) return;

    try {
      const noteRef = doc(db, 'users', userId, 'jobcards', jobCardId, 'notes', noteId);
      await updateDoc(noteRef, {
        content: editContent,
        editedAt: serverTimestamp()
      });
      setEditingId(null);
      setEditContent("");
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Failed to update note. Please try again.");
    }
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Notes</h2>
        <p className="text-gray-600 mt-1">Add important observations and reminders</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a new note..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 min-h-24 resize-none"
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            className="px-6 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Add Note
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedNotes.map((note) => (
          <div
            key={note.id}
            className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
              note.pinned ? 'border-l-4 border-orange-400' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {note.pinned && (
                  <span className="text-orange-400 text-xl" title="Pinned">📌</span>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
                      {note.user.split(' ').map(n => n[0]).join('')}
                    </span>
                    <span className="font-semibold text-gray-800">{note.user}</span>
                  </div>
                </div>
              </div>
              <span className="text-sm text-gray-500">{note.timestamp}</span>
            </div>

            {editingId === note.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 min-h-24 resize-none mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(note.id)}
                    className="px-4 py-1 bg-orange-400 text-white rounded hover:bg-orange-500 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-700 mb-3 whitespace-pre-wrap">{note.content}</p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePinNote(note.id, note.pinned)}
                    className="text-sm text-gray-600 hover:text-orange-400 transition-colors"
                  >
                    {note.pinned ? '📌 Unpin' : '📌 Pin'}
                  </button>
                  <button
                    onClick={() => handleEditNote(note.id, note.content)}
                    className="text-sm text-gray-600 hover:text-blue-500 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-sm text-gray-600 hover:text-red-500 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {notes.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-md">
          <p className="text-lg">No notes yet</p>
          <p className="text-sm mt-2">Add your first note above to get started</p>
        </div>
      )}
    </div>
  );
};

export default NotesView;