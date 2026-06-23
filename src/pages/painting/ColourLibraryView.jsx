import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getFirestore,
} from "firebase/firestore";
import { Layers, Plus, Trash2, X, Search, Copy, Check } from "lucide-react";

const PALETTE_TAGS = [
  "Neutral",
  "Warm",
  "Cool",
  "Bold",
  "Pastel",
  "Exterior",
  "Interior",
  "Trim",
];

const emptyColour = {
  name: "",
  hex: "#D9A05B",
  brand: "",
  code: "",
  tag: "Neutral",
  notes: "",
};

function isValidHex(value) {
  return /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(value);
}

export default function ColourLibraryView({ user }) {
  const [colours, setColours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyColour);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("All");
  const [copiedHex, setCopiedHex] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (user?.uid) loadColours();
  }, [user]);

  const loadColours = async () => {
    setLoading(true);
    try {
      const db = getFirestore();
      const q = query(
        collection(db, "users", user.uid, "colourLibrary"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      setColours(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error loading colour library:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyColour);
    setFormError("");
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    if (!form.name.trim()) {
      setFormError("Colour name is required");
      return;
    }
    if (!isValidHex(form.hex)) {
      setFormError("Enter a valid hex code, e.g. #D9A05B");
      return;
    }
    setFormError("");

    try {
      const db = getFirestore();
      await addDoc(collection(db, "users", user.uid, "colourLibrary"), {
        name: form.name.trim(),
        hex: form.hex,
        brand: form.brand.trim(),
        code: form.code.trim(),
        tag: form.tag,
        notes: form.notes.trim(),
        createdAt: serverTimestamp(),
      });
      setShowForm(false);
      resetForm();
      loadColours();
    } catch (error) {
      console.error("Error saving colour:", error);
      setFormError("Failed to save colour. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!user?.uid) return;
    if (!window.confirm("Remove this colour from your library?")) return;
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "users", user.uid, "colourLibrary", id));
      setColours((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting colour:", error);
    }
  };

  const handleCopy = async (hex) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(""), 1500);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  const filteredColours = colours.filter((c) => {
    const matchesSearch =
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.brand?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase());
    const matchesTag = tagFilter === "All" || c.tag === tagFilter;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <Layers className="w-6 h-6 text-rose-600" />
            </div>
            Colour Library
          </h1>
          <p className="text-slate-600 mt-1 ml-13">
            Save and organise palettes for quick reference on quotes
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-semibold shadow-md hover:from-rose-700 hover:to-pink-700 hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Colour
        </button>
      </div>

      {/* Search & filter */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand, or code..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
          />
        </div>
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
        >
          <option value="All">All Tags</option>
          {PALETTE_TAGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Swatch grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500">
          Loading colour library...
        </div>
      ) : filteredColours.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-dashed border-slate-300">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-700 font-semibold text-lg">
            {colours.length === 0
              ? "No colours saved yet"
              : "No colours match your search"}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            {colours.length === 0 &&
              "Add swatches from your favourite palettes"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredColours.map((c) => (
            <div
              key={c.id}
              className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all"
            >
              <div
                className="h-24 w-full relative"
                style={{ backgroundColor: c.hex }}
              >
                <button
                  onClick={() => handleDelete(c.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3">
                <div className="font-semibold text-slate-800 text-sm truncate">
                  {c.name}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <button
                    onClick={() => handleCopy(c.hex)}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-mono"
                    title="Copy hex code"
                  >
                    {copiedHex === c.hex ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {c.hex}
                  </button>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    {c.tag}
                  </span>
                </div>
                {(c.brand || c.code) && (
                  <div className="text-xs text-slate-500 mt-1.5 truncate">
                    {[c.brand, c.code].filter(Boolean).join(" · ")}
                  </div>
                )}
                {c.notes && (
                  <div
                    className="text-xs text-slate-400 mt-1 truncate"
                    title={c.notes}
                  >
                    {c.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Colour Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-rose-600" />
                Add Colour
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
                  {formError}
                </div>
              )}

              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-xl border border-slate-200 shadow-sm flex-shrink-0"
                  style={{
                    backgroundColor: isValidHex(form.hex)
                      ? form.hex
                      : "#e2e8f0",
                  }}
                />
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Hex Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.hex}
                    onChange={(e) => setForm({ ...form, hex: e.target.value })}
                    placeholder="#D9A05B"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Colour Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Desert Sand"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                    placeholder="e.g. Dulux"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Colour Code
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. DLX-2204"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Tag
                </label>
                <select
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
                >
                  {PALETTE_TAGS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. Used on Meridian project, pairs well with white trim"
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-lg font-semibold hover:from-rose-700 hover:to-pink-700 shadow-md transition-all"
              >
                Save Colour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
