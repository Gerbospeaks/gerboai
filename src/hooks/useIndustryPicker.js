import { useState, useCallback } from "react";

export function useIndustryPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [intent, setIntent] = useState("register"); 

  const open = useCallback((intent = "register") => {
    setIntent(intent);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, intent, open, close };
}
 