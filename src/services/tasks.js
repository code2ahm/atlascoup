import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { formatDateKey } from '../lib/utils';

function getTaskDocRef(uid, dateKey) {
  return doc(db, 'users', uid, 'taskdays', dateKey);
}

export async function getTasks(uid, date = new Date()) {
  const dateKey = formatDateKey(date);
  const snap = await getDoc(getTaskDocRef(uid, dateKey));
  if (snap.exists()) {
    return snap.data().tasks || [];
  }
  return [];
}

export async function saveTasks(uid, tasks, date = new Date()) {
  const dateKey = formatDateKey(date);
  await setDoc(getTaskDocRef(uid, dateKey), { tasks });
}

export async function saveTasksForDateRange(uid, tasksByDate) {
  const batchWrites = Object.entries(tasksByDate).map(([dateKey, tasks]) =>
    setDoc(getTaskDocRef(uid, dateKey), { tasks })
  );
  await Promise.all(batchWrites);
}
