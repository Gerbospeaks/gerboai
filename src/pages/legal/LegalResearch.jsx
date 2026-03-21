import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  BookOpen,
  Plus,
  X,
  Edit2,
  Trash2,
  Search,
  Tag,
  ExternalLink,
  FileText,
  Scale,
  Bookmark,
  ChevronDown,
  Eye,
  Copy,
  Check,
} from "lucide-react";

const CATEGORIES = [
  {
    value: "case_law",
    label: "Case Law",
    color: "bg-[#ede9fe] text-[#5b21b6]",
  },
  {
    value: "legislation",
    label: "Legislation",
    color: "bg-[#dbeafe] text-[#1d4ed8]",
  },
  {
    value: "commentary",
    label: "Commentary",
    color: "bg-[#dcfce7] text-[#166534]",
  },
  {
    value: "academic",
    label: "Academic",
    color: "bg-[#fef3c7] text-[#92400e]",
  },
  {
    value: "international",
    label: "International",
    color: "bg-[#f0fdfa] text-[#0891b2]",
  },
  {
    value: "practice_note",
    label: "Practice Note",
    color: "bg-[#fff7ed] text-[#9a3412]",
  },
  { value: "other", label: "Other", color: "bg-[#f1f5f9] text-[#475569]" },
];

const JURISDICTIONS = [
  "South Africa",
  "Constitutional Court",
  "Supreme Court of Appeal",
  "High Court — WCC",
  "High Court — GPJ",
  "High Court — KZN",
  "Labour Court",
  "Land Claims Court",
  "SADC",
  "ECHR",
  "Other",
];

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] transition-colors";

const EMPTY_FORM = {
  title: "",
  category: "case_law",
  citation: "",
  jurisdiction: "South Africa",
  year: "",
  court: "",
  judge: "",
  caseNumber: "",
  linkedCase: "",
  summary: "",
  keyPrinciples: "",
  notes: "",
  url: "",
  tags: "",
  relevance: "",
};

export default function LegalResearch({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [copied, setCopied] = useState(null);

  const db = getFirestore();

  useEffect(() => {
    if (user?.uid) load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "legalResearch"),
          orderBy("createdAt", "desc"),
        ),
      );
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (_) {}
    setLoading(false);
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ ...EMPTY_FORM, ...item });
    setViewItem(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title) return alert("Title is required.");
    setSaving(true);
    try {
      const payload = { ...form, updatedAt: serverTimestamp() };
      if (editItem) {
        await updateDoc(
          doc(db, "users", user.uid, "legalResearch", editItem.id),
          payload,
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "legalResearch"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      load();
    } catch (_) {
      alert("Save failed.");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "legalResearch", id));
      setDeleteConfirm(null);
      if (viewItem?.id === id) setViewItem(null);
      load();
    } catch (_) {}
  };

  const copyCitation = (citation, id) => {
    navigator.clipboard.writeText(citation);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const getCatConfig = (val) =>
    CATEGORIES.find((c) => c.value === val) || CATEGORIES[6];

  const filtered = items.filter((d) => {
    const s = (search || "").toLowerCase();
    const matchSearch =
      !s ||
      d.title?.toLowerCase().includes(s) ||
      d.citation?.toLowerCase().includes(s) ||
      d.summary?.toLowerCase().includes(s) ||
      d.tags?.toLowerCase().includes(s) ||
      d.linkedCase?.toLowerCase().includes(s);
    const matchCat = filterCat === "all" || d.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f0fdfa] rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#0891b2]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1e293b]">
                Legal Research
              </h1>
              <p className="text-xs text-[#64748b]">
                Case law, legislation, commentary and notes
              </p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Research
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.slice(0, 4).map((cat) => (
            <div
              key={cat.value}
              className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
            >
              <p className="text-xs text-[#64748b] mb-1">{cat.label}</p>
              <p className="text-2xl font-bold text-[#1e293b]">
                {items.filter((i) => i.category === cat.value).length}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, citation, tags, case..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCat("all")}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${filterCat === "all" ? "bg-[#7c3aed] text-white" : "bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"}`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilterCat(cat.value)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${filterCat === cat.value ? "bg-[#7c3aed] text-white" : "bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="text-center py-12 text-sm text-[#94a3b8]">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 bg-[#f1f5f9] rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-[#94a3b8]" />
            </div>
            <p className="text-sm font-medium text-[#374151] mb-1">
              No research saved
            </p>
            <p className="text-xs text-[#94a3b8] mb-4">
              Start building your research library
            </p>
            <button
              onClick={openAdd}
              className="px-4 py-1.5 bg-[#7c3aed] text-white rounded-lg text-xs font-medium"
            >
              Add Research
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => {
              const cat = getCatConfig(item.category);
              return (
                <div
                  key={item.id}
                  className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cat.color}`}
                          >
                            {cat.label}
                          </span>
                          {item.year && (
                            <span className="text-xs text-[#94a3b8]">
                              {item.year}
                            </span>
                          )}
                          {item.jurisdiction &&
                            item.jurisdiction !== "South Africa" && (
                              <span className="text-xs text-[#94a3b8]">
                                {item.jurisdiction}
                              </span>
                            )}
                        </div>
                        <h3 className="text-sm font-bold text-[#1e293b] leading-tight">
                          {item.title}
                        </h3>
                        {item.citation && (
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-[#7c3aed] font-mono">
                              {item.citation}
                            </p>
                            <button
                              onClick={() =>
                                copyCitation(item.citation, item.id)
                              }
                              className="text-[#94a3b8] hover:text-[#7c3aed] transition-colors"
                            >
                              {copied === item.id ? (
                                <Check className="w-3 h-3 text-[#059669]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setViewItem(item)}
                          className="p-1.5 text-[#64748b] hover:text-[#0891b2] hover:bg-[#f0fdfa] rounded-lg transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 text-[#64748b] hover:text-[#7c3aed] hover:bg-[#ede9fe] rounded-lg transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {item.summary && (
                      <p className="text-xs text-[#64748b] line-clamp-2 mb-3">
                        {item.summary}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 items-center">
                      {item.linkedCase && (
                        <span className="flex items-center gap-1 text-xs bg-[#f1f5f9] text-[#475569] px-2 py-0.5 rounded">
                          <Scale className="w-3 h-3" />
                          {item.linkedCase}
                        </span>
                      )}
                      {item.tags &&
                        item.tags
                          .split(",")
                          .filter(Boolean)
                          .map((tag) => (
                            <span
                              key={tag}
                              className="flex items-center gap-1 text-xs bg-[#ede9fe] text-[#5b21b6] px-2 py-0.5 rounded"
                            >
                              <Tag className="w-3 h-3" />
                              {tag.trim()}
                            </span>
                          ))}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-[#2563eb] hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Source
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
              <div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getCatConfig(viewItem.category).color}`}
                >
                  {getCatConfig(viewItem.category).label}
                </span>
                <h2 className="text-base font-semibold text-[#1e293b] mt-1">
                  {viewItem.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(viewItem)}
                  className="px-3 py-1.5 text-xs bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9]"
                >
                  Edit
                </button>
                <button
                  onClick={() => setViewItem(null)}
                  className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {viewItem.citation && (
                <div className="bg-[#f8fafc] rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm font-mono text-[#7c3aed]">
                    {viewItem.citation}
                  </span>
                  <button
                    onClick={() => copyCitation(viewItem.citation, viewItem.id)}
                    className="text-xs text-[#64748b] flex items-center gap-1 hover:text-[#7c3aed]"
                  >
                    {copied === viewItem.id ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}{" "}
                    Copy
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  ["Jurisdiction", viewItem.jurisdiction],
                  ["Year", viewItem.year],
                  ["Court", viewItem.court],
                  ["Judge", viewItem.judge],
                  ["Case Number", viewItem.caseNumber],
                  ["Linked Matter", viewItem.linkedCase],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[#94a3b8] mb-0.5">{k}</p>
                      <p className="font-medium text-[#374151]">{v}</p>
                    </div>
                  ))}
              </div>
              {viewItem.summary && (
                <Section label="Summary" content={viewItem.summary} />
              )}
              {viewItem.keyPrinciples && (
                <Section
                  label="Key Principles"
                  content={viewItem.keyPrinciples}
                />
              )}
              {viewItem.relevance && (
                <Section
                  label="Relevance to Matter"
                  content={viewItem.relevance}
                />
              )}
              {viewItem.notes && (
                <Section label="Notes" content={viewItem.notes} />
              )}
              {viewItem.tags && (
                <div>
                  <p className="text-xs font-semibold text-[#94a3b8] uppercase mb-2">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {viewItem.tags
                      .split(",")
                      .filter(Boolean)
                      .map((t) => (
                        <span
                          key={t}
                          className="text-xs bg-[#ede9fe] text-[#5b21b6] px-2 py-0.5 rounded"
                        >
                          {t.trim()}
                        </span>
                      ))}
                  </div>
                </div>
              )}
              {viewItem.url && (
                <a
                  href={viewItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-[#2563eb] hover:underline"
                >
                  <ExternalLink className="w-4 h-4" /> View Source
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-sm font-semibold text-[#1e293b] mb-2">
              Delete Research Entry
            </h3>
            <p className="text-xs text-[#64748b] mb-5">
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-[#e2e8f0] text-[#374151] text-sm rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-[#dc2626] text-white text-sm rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editItem ? "Edit Research" : "Add Research"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Classification */}
              <div>
                <p className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest mb-3">
                  Classification
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => set("category", e.target.value)}
                      className={selectCls}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Jurisdiction</label>
                    <select
                      value={form.jurisdiction}
                      onChange={(e) => set("jurisdiction", e.target.value)}
                      className={selectCls}
                    >
                      {JURISDICTIONS.map((j) => (
                        <option key={j}>{j}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Reference */}
              <div>
                <p className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest mb-3">
                  Reference Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Title *</label>
                    <input
                      value={form.title}
                      onChange={(e) => set("title", e.target.value)}
                      placeholder="e.g. Pharmaceutical Manufacturers v President"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Citation</label>
                    <input
                      value={form.citation}
                      onChange={(e) => set("citation", e.target.value)}
                      placeholder="e.g. 2000 (2) SA 674 (CC)"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Year</label>
                    <input
                      value={form.year}
                      onChange={(e) => set("year", e.target.value)}
                      placeholder="e.g. 2024"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Court / Publication</label>
                    <input
                      value={form.court}
                      onChange={(e) => set("court", e.target.value)}
                      placeholder="e.g. Constitutional Court"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Judge / Author</label>
                    <input
                      value={form.judge}
                      onChange={(e) => set("judge", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Case Number</label>
                    <input
                      value={form.caseNumber}
                      onChange={(e) => set("caseNumber", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Linked Matter / Case</label>
                    <input
                      value={form.linkedCase}
                      onChange={(e) => set("linkedCase", e.target.value)}
                      placeholder="Your matter this relates to"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <p className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest mb-3">
                  Content
                </p>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Summary</label>
                    <textarea
                      value={form.summary}
                      onChange={(e) => set("summary", e.target.value)}
                      rows={3}
                      placeholder="Brief summary of the case / legislation / article..."
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>
                      Key Principles / Ratio Decidendi
                    </label>
                    <textarea
                      value={form.keyPrinciples}
                      onChange={(e) => set("keyPrinciples", e.target.value)}
                      rows={3}
                      placeholder="Key legal principles established..."
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Relevance to My Matter</label>
                    <textarea
                      value={form.relevance}
                      onChange={(e) => set("relevance", e.target.value)}
                      rows={2}
                      placeholder="How this applies to your current case..."
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => set("notes", e.target.value)}
                      rows={2}
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div>
                <p className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest mb-3">
                  Metadata
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Tags (comma-separated)</label>
                    <input
                      value={form.tags}
                      onChange={(e) => set("tags", e.target.value)}
                      placeholder="e.g. delict, negligence, vicarious"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Source URL</label>
                    <input
                      value={form.url}
                      onChange={(e) => set("url", e.target.value)}
                      placeholder="https://..."
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-[#e2e8f0] text-[#374151] text-sm rounded-lg hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg disabled:opacity-60"
              >
                {saving ? "Saving..." : editItem ? "Update" : "Add Research"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ label, content }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#94a3b8] uppercase mb-1.5">
        {label}
      </p>
      <p className="text-sm text-[#374151] whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
    </div>
  );
}
