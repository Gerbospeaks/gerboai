import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

const db = getFirestore();

// ── Generate receipt number ───────────────────────────────────────────────────
export const generateReceiptNumber = async (userId) => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const paymentsRef = collection(db, "users", userId, "payments");
  const snap = await getDocs(query(paymentsRef, orderBy("createdAt", "desc")));
  const count = snap.size + 1;
  return `RCP-${year}${month}-${String(count).padStart(4, "0")}`;
};

// ── Main hook ────────────────────────────────────────────────────────────────
export const useFeesFirebase = (userId) => {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Real-time students listener ─────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const unsub = onSnapshot(
      query(
        collection(db, "users", userId, "students"),
        orderBy("createdAt", "desc"),
      ),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setStudents(data);
        setLoading(false);
      },
      (err) => {
        console.error("useFeesFirebase students error:", err);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [userId]);

  // ── Real-time payments listener ─────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const unsub = onSnapshot(
      query(
        collection(db, "users", userId, "payments"),
        orderBy("createdAt", "desc"),
      ),
      (snap) => {
        setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
    );

    return () => unsub();
  }, [userId]);

  // ── Record a payment ────────────────────────────────────────────────────
  const recordPayment = async ({
    studentId,
    amount,
    method,
    notes,
    studentName,
    term,
  }) => {
    if (!userId) return null;

    const receiptNumber = await generateReceiptNumber(userId);

    // 1. Save payment record
    const paymentRef = await addDoc(
      collection(db, "users", userId, "payments"),
      {
        studentId,
        studentName,
        amount: Number(amount),
        method: method || "cash",
        notes: notes || "",
        term: term || "Term 1",
        receiptNumber,
        createdAt: serverTimestamp(),
      },
    );

    // 2. Update student fees.paid + status
    const student = students.find((s) => s.id === studentId);
    if (student) {
      const newPaid = (student.fees?.paid || 0) + Number(amount);
      const total = student.fees?.total || 0;
      const newStatus =
        newPaid >= total ? "paid" : newPaid > 0 ? "partial" : "unpaid";

      await updateDoc(doc(db, "users", userId, "students", studentId), {
        "fees.paid": newPaid,
        "fees.status": newStatus,
        updatedAt: serverTimestamp(),
      });
    }

    return { receiptNumber, paymentId: paymentRef.id };
  };

  // ── Update fee structure (e.g. set total/term) ──────────────────────────
  const updateFeeStructure = async (studentId, { total, term }) => {
    if (!userId) return;
    await updateDoc(doc(db, "users", userId, "students", studentId), {
      "fees.total": Number(total),
      "fees.term": term,
      updatedAt: serverTimestamp(),
    });
  };

  // ── Get payments for one student ────────────────────────────────────────
  const getStudentPayments = (studentId) =>
    payments.filter((p) => p.studentId === studentId);

const totalFees = students.reduce((s, st) => s + Number(st.fees?.total || 0), 0);
const collectedFees = students.reduce((s, st) => s + Number(st.fees?.paid || 0), 0);

  return {
    students,
    payments,
    loading,
    totalFees,
    collectedFees,
    recordPayment,
    updateFeeStructure,
    getStudentPayments,
  };
};
