import React, { useState, useEffect } from "react";
import { FileText, Check, Loader2, ChevronDown } from "lucide-react";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { LETTERHEAD_TEMPLATE_NAMES } from "./LetterheadRenderer";

/**
 * LetterheadTemplateSelector
 * Mirrors TemplateSelector (invoice templates) field-for-field:
 *  - purchased list seeded/loaded from Firestore at
 *    users/{uid}/settings/letterheadTemplates
 *  - dropdown with active checkmark
 *  - footer upsell hint
 *
 * Selecting a template only changes which design is active — it does not
 * touch the letter content itself, since that's held in memory by the
 * parent editor (see LetterheadEditor).
 */
export const LetterheadTemplateSelector = ({
  user,
  selectedTemplate,
  onTemplateChange,
}) => {
  const [purchasedTemplates, setPurchasedTemplates] = useState([
    "racing",
    "accent",
  ]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // ── Load purchased list from Firestore ─────────────────────────────────
  useEffect(() => {
    if (!user?.uid) return;

    const load = async () => {
      try {
        const db = getFirestore();
        const snap = await getDoc(
          doc(db, "users", user.uid, "settings", "letterheadTemplates"),
        );

        if (snap.exists()) {
          const data = snap.data();
          const ids = Array.from(
            new Set(["racing", ...(data.purchased ?? ["accent"])]),
          );
          setPurchasedTemplates(ids);

          // Restore last active template if parent hasn't set one
          if (!selectedTemplate && data.active) {
            onTemplateChange(data.active);
          }
        } else {
          // First-time user — seed the doc
          await setDoc(
            doc(db, "users", user.uid, "settings", "letterheadTemplates"),
            {
              purchased: ["accent"],
              active: "racing",
              createdAt: serverTimestamp(),
            },
            { merge: true },
          );
          setPurchasedTemplates(["racing", "accent"]);
        }
      } catch (err) {
        console.error("LetterheadTemplateSelector load:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // ── Handle selection ───────────────────────────────────────────────────
  const handleSelectTemplate = async (templateId) => {
    setIsOpen(false);
    onTemplateChange(templateId);

    // Persist active choice to Firestore (best-effort)
    if (!user?.uid) return;
    try {
      await setDoc(
        doc(
          getFirestore(),
          "users",
          user.uid,
          "settings",
          "letterheadTemplates",
        ),
        { active: templateId, updatedAt: serverTimestamp() },
        { merge: true },
      );
    } catch (err) {
      console.error("LetterheadTemplateSelector persist active:", err);
    }
  };

  const displayName =
    LETTERHEAD_TEMPLATE_NAMES[selectedTemplate] ?? "Select Letterhead";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 shadow-sm"
      >
        <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <span className="hidden sm:inline max-w-[160px] truncate">
          {displayName}
        </span>
        <span className="sm:hidden">Letterhead</span>
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin ml-1" />
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 ml-1 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Your Letterheads
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
              </div>
            ) : (
              <div className="py-1 max-h-72 overflow-y-auto">
                {purchasedTemplates.map((templateId) => {
                  const isActive = selectedTemplate === templateId;
                  return (
                    <button
                      key={templateId}
                      onClick={() => handleSelectTemplate(templateId)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="truncate">
                        {LETTERHEAD_TEMPLATE_NAMES[templateId] ?? templateId}
                      </span>
                      {isActive && (
                        <Check className="w-4 h-4 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Footer hint */}
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
              <p className="text-[11px] text-gray-400">
                Buy more letterheads in{" "}
                <span className="text-blue-500 font-medium">Templates</span> →
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LetterheadTemplateSelector;
