"use client";
import { useEffect, useState } from "react";
import { PALETTES } from "../lib/palettes";
import { loadPaletteSelections, savePaletteSelections } from "../lib/themeService";

const GRADES = ["R","0","1","2","3","4","5","6","7"];

export function GradeThemePicker({ schoolId }) {
  const [selections, setSelections] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPaletteSelections(schoolId).then(setSelections);
  }, [schoolId]);

  async function handleSave() {
    setSaving(true);
    await savePaletteSelections(schoolId, selections);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      {GRADES.map(g => (
        <div key={g} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid #e5e7eb" }}>
          <span style={{ width:72, fontWeight:500, fontSize:14 }}>Grade {g}</span>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {PALETTES.map(pal => (
              <button
                key={pal.id}
                title={pal.name}
                onClick={() => setSelections(s => ({ ...s, [g]: pal.id }))}
                style={{
                  display:"flex", gap:3, padding:"4px 6px",
                  borderRadius:6, cursor:"pointer",
                  border: selections[g] === pal.id ? `2px solid ${pal.p}` : "1.5px solid #e5e7eb",
                  background: selections[g] === pal.id ? pal.lt : "#f9fafb",
                }}
              >
                {[pal.p, pal.accent1 ?? pal.bd, pal.lt].map((c,i) => (
                  <span key={i} style={{ width:14, height:14, borderRadius:3, background:c, display:"block" }} />
                ))}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{ marginTop:16, padding:"8px 20px", background:"#111827", color:"#fff", borderRadius:8, border:"none", cursor:"pointer" }}
      >
        {saving ? "Saving…" : saved ? "Saved!" : "Save themes"}
      </button>
    </div>
  );
}