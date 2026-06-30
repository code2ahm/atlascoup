import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getMonthId, formatDateKey } from '../lib/utils';

function getHabitsCollection(uid, monthId) {
  return collection(db, 'users', uid, 'habits', monthId, 'items');
}

export async function getHabits(uid, date = new Date()) {
  const monthId = getMonthId(date);
  const q = query(getHabitsCollection(uid, monthId), orderBy('order'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export function subscribeHabits(uid, date, onData, onError = () => {}) {
  const monthId = getMonthId(date);
  const q = query(getHabitsCollection(uid, monthId), orderBy('order'));
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, onError);
}

export async function addHabit(uid, name, repeatDaily = false, order = 0, date = new Date()) {
  const monthId = getMonthId(date);
  const createdAt = formatDateKey(date);
  const ref = await addDoc(getHabitsCollection(uid, monthId), {
    name,
    days: {},
    repeatDaily,
    createdAt,
    order,
  });
  return { id: ref.id, name, days: {}, repeatDaily, createdAt, order };
}

export async function getHabitsFromMonth(uid, monthId) {
  const q = query(getHabitsCollection(uid, monthId), orderBy('order'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function copyRepeatableHabits(uid, fromMonthId, toMonthId, today = new Date()) {
  const habits = await getHabitsFromMonth(uid, fromMonthId);
  const repeatable = habits.filter(h => h.repeatDaily);
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const createdAt = formatDateKey(firstOfMonth);
  for (const habit of repeatable) {
    const { id, days, ...rest } = habit;
    await addDoc(getHabitsCollection(uid, toMonthId), { ...rest, days: {}, createdAt });
  }
  return repeatable.length;
}

export async function updateHabit(uid, habitId, data, date = new Date()) {
  const monthId = getMonthId(date);
  const ref = doc(db, 'users', uid, 'habits', monthId, 'items', habitId);
  await updateDoc(ref, data);
}

export async function batchUpdateOrder(uid, date, updates) {
  const monthId = getMonthId(date);
  const batch = [];
  const colRef = getHabitsCollection(uid, monthId);
  for (const { id, order } of updates) {
    batch.push(updateDoc(doc(colRef, id), { order }));
  }
  await Promise.all(batch);
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
