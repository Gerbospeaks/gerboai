import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';



const TEMPLATE_DOC = (uid) =>
  doc(db, 'users', uid, 'settings', 'templateSettings');

const DEFAULT_PURCHASED = ['professional'];
const DEFAULT_ACTIVE    = 'professional';

export function useUserTemplates(user) {
  const [purchased,       setPurchased]       = useState(DEFAULT_PURCHASED);
  const [activeTemplate,  setActiveTemplate]  = useState(DEFAULT_ACTIVE);
  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);

  /* ── Load from Firestore on mount ── */
  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      try {
        const snap = await getDoc(TEMPLATE_DOC(user.uid));
        if (snap.exists()) {
          const data = snap.data();
          // Always ensure 'professional' is present (free default)
          const p = Array.from(new Set([...DEFAULT_PURCHASED, ...(data.purchased || [])]));
          setPurchased(p);
          setActiveTemplate(data.activeTemplate || DEFAULT_ACTIVE);
        }
      } catch (e) {
        console.error('useUserTemplates load:', e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  /* ── Save entire state to Firestore ── */
  const persist = useCallback(async (nextPurchased, nextActive) => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      await setDoc(TEMPLATE_DOC(user.uid), {
        purchased:      nextPurchased,
        activeTemplate: nextActive,
        updatedAt:      serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.error('useUserTemplates save:', e.message);
      throw e;
    } finally {
      setSaving(false);
    }
  }, [user?.uid]);

  /* ── Add a newly purchased template ── */
  const addPurchased = useCallback(async (templateId) => {
    const next = Array.from(new Set([...purchased, templateId]));
    setPurchased(next);
    await persist(next, activeTemplate);
  }, [purchased, activeTemplate, persist]);

  /* ── Change the active template and persist ── */
  const changeActive = useCallback(async (templateId) => {
    setActiveTemplate(templateId);
    await persist(purchased, templateId);
  }, [purchased, persist]);

  return {
    purchased,
    activeTemplate,
    loading,
    saving,
    addPurchased,
    changeActive,
    isOwned: (id) => purchased.includes(id),
  };
}