import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export const logHistory = async (jobCardId, action, details) => {
  const userId = auth.currentUser?.uid;
  if (!userId || !jobCardId) return;

  try {
    const historyRef = collection(db, 'users', userId, 'jobcards', jobCardId, 'history');
    await addDoc(historyRef, {
      timestamp: serverTimestamp(),
      user: auth.currentUser?.displayName || auth.currentUser?.email || 'Unknown User',
      action,
      details
    });
  } catch (error) {
    console.error("Error logging history:", error);
  }
};