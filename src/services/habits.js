import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getMonthId } from '../lib/utils';

function getHabitsCollection(uid, monthId) {
  return collection(db, 'users', uid, 'habits', monthId, 'items');
}

export async function getHabits(uid, date = new Date()) {
  const monthId = getMonthId(date);
  const q = query(getHabitsCollection(uid, monthId), orderBy('order'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addHabit(uid, name, order = 0, date = new Date()) {
  const monthId = getMonthId(date);
  const ref = await addDoc(getHabitsCollection(uid, monthId), {
    name,
    days: {},
    order,
  });
  return { id: ref.id, name, days: {}, order };
}

export async function updateHabit(uid, habitId, data, date = new Date()) {
  const monthId = getMonthId(date);
  const ref = doc(db, 'users', uid, 'habits', monthId, 'items', habitId);
  await updateDoc(ref, data);
}

export async function deleteHabit(uid, habitId, date = new Date()) {
  const monthId = getMonthId(date);
  const ref = doc(db, 'users', uid, 'habits', monthId, 'items', habitId);
  await deleteDoc(ref);
}

export async function toggleHabitDay(uid, habitId, day, value, date = new Date()) {
  const monthId = getMonthId(date);
  const ref = doc(db, 'users', uid, 'habits', monthId, 'items', habitId);
  await updateDoc(ref, { [`days.${day}`]: value });
}
