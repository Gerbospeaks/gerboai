// ─────────────────────────────────────────────────────────────────────────────
// firebaseEducation.js
// Drop-in Firebase persistence for EducationDashboard
//
// SETUP:
//   1. Import this file's hooks/functions into EducationDashboard.jsx
//   2. Replace each useState(MOCK_*) with the matching useFirebase* hook
//   3. Replace inline save/delete handlers with the ones exported here
//
// FIRESTORE STRUCTURE:
//   users/{uid}/notices/{noticeId}
//   users/{uid}/homework/{taskId}
//   users/{uid}/attendance/{date}/records/{studentId}
//   users/{uid}/events/{eventId}
//   users/{uid}/staff/{staffId}
//   users/{uid}/students/{studentId}   ← fees live here as fields
//   users/{uid}/timetable/{className}  ← one doc per class
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const db = getFirestore();

const userCol = (uid, col) => collection(db, "users", uid, col);
const userDoc = (uid, col, id) => doc(db, "users", uid, col, id);

export function useNotices(uid) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const q = query(userCol(uid, "notices"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setNotices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error loading notices:", e);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { load(); }, [load]);

  const saveNotice = async (noticeForm) => {
    if (!uid || !noticeForm.title || !noticeForm.message) return;
    try {
      await addDoc(userCol(uid, "notices"), {
        ...noticeForm,
        date: new Date().toISOString().split("T")[0],
        read: false,
        createdAt: serverTimestamp(),
      });
      await load();
    } catch (e) {
      console.error("Error saving notice:", e);
    }
  };

  const markNoticeRead = async (id) => {
    if (!uid) return;
    try {
      await updateDoc(userDoc(uid, "notices", id), { read: true });
      setNotices((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error("Error marking notice read:", e);
    }
  };

  const deleteNotice = async (id) => {
    if (!uid) return;
    try {
      await deleteDoc(userDoc(uid, "notices", id));
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      console.error("Error deleting notice:", e);
    }
  };

  return { notices, setNotices, loading, saveNotice, markNoticeRead, deleteNotice, reload: load };
}

export function useHomework(uid) {
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const q = query(userCol(uid, "homework"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setHomework(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error loading homework:", e);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { load(); }, [load]);

  const saveHomework = async (newHomework) => {
    if (!uid || !newHomework.title || !newHomework.subject) return;
    try {
      await addDoc(userCol(uid, "homework"), {
        ...newHomework,
        assignedBy: "Principal",         
        createdAt: serverTimestamp(),
      });
      await load();
    } catch (e) {
      console.error("Error saving homework:", e);
    }
  };

  const deleteHomework = async (id) => {
    if (!uid) return;
    try {
      await deleteDoc(userDoc(uid, "homework", id));
      setHomework((prev) => prev.filter((h) => h.id !== id));
    } catch (e) {
      console.error("Error deleting homework:", e);
    }
  };

  return { homework, setHomework, loading, saveHomework, deleteHomework, reload: load };
}

export function useAttendance(uid, dateStr) {
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!uid || !dateStr) return;
    setLoading(true);
    try {
      const recordsCol = collection(
        db, "users", uid, "attendance", dateStr, "records"
      );
      const snap = await getDocs(recordsCol);
      const map = {};
      snap.docs.forEach((d) => { map[d.id] = d.data().status; });
      setAttendance(map);
    } catch (e) {
      console.error("Error loading attendance:", e);
    } finally {
      setLoading(false);
    }
  }, [uid, dateStr]);

  useEffect(() => { load(); }, [load]);
  const saveAttendance = async (userId, studentId, date, status) => {
     const db = getFirestore();
     const docId = `${date}_${studentId}`;
     await setDoc(
       doc(db, "users", userId, "attendance", docId),
       { studentId, date, status, updatedAt: serverTimestamp() },
       { merge: true }
     );
   };
  const saveAllAttendance = async (attendanceMap) => {
    if (!uid || !dateStr) return;
    try {
      const promises = Object.entries(attendanceMap).map(([studentId, status]) => {
        const recordDoc = doc(
          db, "users", uid, "attendance", dateStr, "records", String(studentId)
        );
        return setDoc(recordDoc, {
          status,
          studentId: String(studentId),
          updatedAt: serverTimestamp(),
        });
      });
      await Promise.all(promises);
      alert("Attendance register saved!");
    } catch (e) {
      console.error("Error saving all attendance:", e);
      alert("Failed to save attendance. Please try again.");
    }
  };

  return { attendance, setAttendance, loading, saveAttendance, saveAllAttendance, reload: load };
}

export function useEvents(uid) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const q = query(userCol(uid, "events"), orderBy("date", "asc"));
      const snap = await getDocs(q);
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error loading events:", e);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { load(); }, [load]);

  const saveEvent = async (eventData) => {
    if (!uid || !eventData.title || !eventData.date) return;
    try {
      await addDoc(userCol(uid, "events"), {
        ...eventData,
        createdAt: serverTimestamp(),
      });
      await load();
    } catch (e) {
      console.error("Error saving event:", e);
    }
  };
  const deleteEvent = async (id) => {
    if (!uid) return;
    try {
      await deleteDoc(userDoc(uid, "events", id));
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      console.error("Error deleting event:", e);
    }
  };

  return { events, setEvents, loading, saveEvent, deleteEvent, reload: load };
}

export function useStaff(uid) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const q = query(userCol(uid, "staff"), orderBy("name", "asc"));
      const snap = await getDocs(q);
      setStaff(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error loading staff:", e);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { load(); }, [load]);

  const saveStaff = async (staffData) => {
    if (!uid || !staffData.name) return;
    try {
      await addDoc(userCol(uid, "staff"), {
        ...staffData,
        createdAt: serverTimestamp(),
      });
      await load();
    } catch (e) {
      console.error("Error saving staff:", e);
    }
  };

  const updateStaff = async (id, updates) => {
    if (!uid) return;
    try {
      await updateDoc(userDoc(uid, "staff", id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
    } catch (e) {
      console.error("Error updating staff:", e);
    }
  };

  const deleteStaff = async (id) => {
    if (!uid) return;
    try {
      await deleteDoc(userDoc(uid, "staff", id));
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error("Error deleting staff:", e);
    }
  };

  return { staff, setStaff, loading, saveStaff, updateStaff, deleteStaff, reload: load };
}

export function useFees(uid) {
 
  const updateFees = async (studentId, feesData) => {
    if (!uid || !studentId) return;
    try {
      await updateDoc(userDoc(uid, "students", studentId), {
        fees: feesData,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Error updating fees:", e);
    }
  };

  return { updateFees };
}

export function useTimetable(uid) {
 
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(userCol(uid, "timetable"));
      const map = {};
      snap.docs.forEach((d) => {
       
        const className = d.id.replace(/-/g, " ");
        map[className] = d.data();
      });
      setTimetable(map);
    } catch (e) {
      console.error("Error loading timetable:", e);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { load(); }, [load]);

  const saveTimetable = async (className, schedule) => {
    if (!uid || !className) return;
    try {
    
      const docId = className.replace(/\s+/g, "-");
      await setDoc(userDoc(uid, "timetable", docId), {
        ...schedule,
        updatedAt: serverTimestamp(),
      });
      setTimetable((prev) => ({ ...prev, [className]: schedule }));
    } catch (e) {
      console.error("Error saving timetable:", e);
    }
  };

  return { timetable, setTimetable, loading, saveTimetable, reload: load };
}

export async function seedMockData(uid, students, staff, events, homework, notices, timetable) {
  if (!uid) return;

  try {
    console.log("Seeding mock data for uid:", uid);
    for (const s of students) {
      await addDoc(userCol(uid, "students"), {
        ...s,
        createdAt: serverTimestamp(),
      });
    }
    for (const s of staff) {
      await addDoc(userCol(uid, "staff"), {
        ...s,
        createdAt: serverTimestamp(),
      });
    }
    for (const e of events) {
      await addDoc(userCol(uid, "events"), {
        ...e,
        createdAt: serverTimestamp(),
      });
    }
    for (const h of homework) {
      await addDoc(userCol(uid, "homework"), {
        ...h,
        createdAt: serverTimestamp(),
      });
    }
    for (const n of notices) {
      await addDoc(userCol(uid, "notices"), {
        ...n,
        createdAt: serverTimestamp(),
      });
    }
    for (const [className, schedule] of Object.entries(timetable)) {
      const docId = className.replace(/\s+/g, "-");
      await setDoc(userDoc(uid, "timetable", docId), {
        ...schedule,
        updatedAt: serverTimestamp(),
      });
    }

    console.log("✅ Mock data seeded successfully");
  } catch (e) {
    console.error("Error seeding mock data:", e);
  }
}
