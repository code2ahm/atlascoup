import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { formatDateKey } from '../lib/utils';

function getJournalCollection(uid) {
  return collection(db, 'users', uid, 'journal');
}

export async function getJournalEntries(uid) {
  const q = query(getJournalCollection(uid), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export function subscribeJournal(uid, onData, onError = () => {}) {
  const q = query(getJournalCollection(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, onError);
}

export async function addJournalEntry(uid, { text, mood, dateKey }) {
  const ref = await addDoc(getJournalCollection(uid), {
    text,
    mood: mood || null,
    dateKey: dateKey || formatDateKey(new Date()),
    createdAt: Timestamp.now(),
  });
  return { id: ref.id, text, mood, dateKey };
}

export async function deleteJournalEntry(uid, entryId) {
  const ref = doc(db, 'users', uid, 'journal', entryId);
  await deleteDoc(ref);
}
