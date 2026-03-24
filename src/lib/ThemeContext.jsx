// lib/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { buildGradeThemes } from "./gradeThemes";
import { loadPaletteSelections } from "./themeService";

const ThemeContext = createContext(null);

export function ThemeProvider({ schoolId, children }) {
  const [gradeThemes, setGradeThemes] = useState(() => buildGradeThemes({}));

  useEffect(() => {
    loadPaletteSelections(schoolId).then(selections => {
      setGradeThemes(buildGradeThemes(selections));
    });
  }, [schoolId]);

  return (
    <ThemeContext.Provider value={{ gradeThemes, setGradeThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useGradeThemes = () => useContext(ThemeContext);