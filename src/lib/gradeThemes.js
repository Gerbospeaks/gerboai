import { PALETTES, DEFAULT_PALETTE_ID } from "./palettes";


const GRADE_STATIC = {
  R:  { grade:"R",  name:"Grade R", tagline:"Rainbow Starters", emoji:"🌈", sv:"pill",   hf:`"Nunito","Arial Rounded MT Bold",Arial,sans-serif`, bf:`"Nunito",Arial,sans-serif` },
  0:  { grade:"0",  name:"Grade 0", tagline:"Bright Beginners",  emoji:"🦋", sv:"pill",   hf:`"Nunito","Arial Rounded MT Bold",Arial,sans-serif`, bf:`"Nunito",Arial,sans-serif` },
  1:  { grade:"1",  name:"Grade 1", tagline:"Sunshine Learners", emoji:"☀️", sv:"filled", hf:`"Nunito","Trebuchet MS",sans-serif`, bf:`"Lato","Segoe UI",sans-serif` },
  2:  { grade:"2",  name:"Grade 2", tagline:"Ocean Explorers",   emoji:"🌊", sv:"outlined",hf:`"Nunito","Trebuchet MS",sans-serif`, bf:`"Lato","Segoe UI",sans-serif` },
  3:  { grade:"3",  name:"Grade 3", tagline:"Forest Growers",    emoji:"🌿", sv:"filled", hf:`"Nunito","Trebuchet MS",sans-serif`, bf:`"Lato","Segoe UI",sans-serif` },
  4:  { grade:"4",  name:"Grade 4", tagline:"Cosmic Thinkers",   emoji:"🚀", sv:"outlined",hf:`"DM Sans","Segoe UI",Arial,sans-serif`, bf:`"DM Sans","Segoe UI",Arial,sans-serif` },
  5:  { grade:"5",  name:"Grade 5", tagline:"Autumn Achievers",  emoji:"🍂", sv:"outlined",hf:`"DM Sans","Segoe UI",Arial,sans-serif`, bf:`"DM Sans","Segoe UI",Arial,sans-serif` },
  6:  { grade:"6",  name:"Grade 6", tagline:"Steel Leaders",     emoji:"⚡", sv:"underlined",hf:`"DM Sans","Segoe UI",Arial,sans-serif`, bf:`"DM Sans","Segoe UI",Arial,sans-serif` },
  7:  { grade:"7",  name:"Grade 7", tagline:"Prestige Graduates",emoji:"🎓", sv:"underlined",hf:`"Playfair Display","Georgia",serif`, bf:`"Georgia","Times New Roman",serif` },
};

function buildTheme(gradeKey, palette) {
  const s = GRADE_STATIC[gradeKey];
  return {
    ...s,
    id: `grade${gradeKey}`,
    paletteId: palette.id,
    p: palette.p, lt: palette.lt, cream: palette.cream,
    bd: palette.bd, mu: palette.mu, fBg: palette.fBg,
    hTxt: palette.hTxt, pgBorder: palette.pgBorder,
    accent1: palette.accent1, accent2: palette.accent2,
    tb: palette.tb,
    cBg: `linear-gradient(135deg,${palette.cream},${palette.lt} 50%,#fff)`,
    tableHeader: (p, bd, cream) => ({
      background: cream ?? palette.cream, color: p, fontWeight: 700,
      fontSize: "7.5pt", padding: "1.5mm 2mm",
      border: `1.5px solid ${bd}`, textAlign: "center",
    }),
    tableCell: (bd, even) => ({
      padding: "1.4mm 2mm", border: `1.5px solid ${bd}`,
      background: even ? palette.lt : "#fff", verticalAlign: "middle",
    }),
  };
}

export function buildGradeThemes(selections = {}) {
  return Object.fromEntries(
    Object.keys(GRADE_STATIC).map(g => {
      const paletteId = selections[g] ?? DEFAULT_PALETTE_ID;
      const palette = PALETTES.find(p => p.id === paletteId) ?? PALETTES[0];
      return [g, buildTheme(g, palette)];
    })
  );
}