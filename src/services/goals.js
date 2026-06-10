import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

function getGoalsCollection(uid) {
  return collection(db, 'users', uid, 'goals');
}

export async function getGoals(uid) {
  const snapshot = await getDocs(getGoalsCollection(uid));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export function subscribeGoals(uid, onData, onError = () => {}) {
  return onSnapshot(getGoalsCollection(uid), (snap) => {
    onData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, onError);
}

export async function addGoal(uid, goalData) {
  const ref = await addDoc(getGoalsCollection(uid), {
    title: goalData.title,
    description: goalData.description || '',
    category: goalData.category || 'general',
    quarter: goalData.quarter,
    year: goalData.year,
    targetDate: goalData.targetDate || '',
    milestones: goalData.milestones || [],
    createdAt: new Date().toISOString(),
  });
  return { id: ref.id, ...goalData };
}

export async function updateGoal(uid, goalId, data) {
  const ref = doc(db, 'users', uid, 'goals', goalId);
  await updateDoc(ref, data);
}

export async function deleteGoal(uid, goalId) {
  const ref = doc(db, 'users', uid, 'goals', goalId);
  await deleteDoc(ref);
}

export async function toggleMilestone(uid, goalId, milestoneIndex, completed) {
  const ref = doc(db, 'users', uid, 'goals', goalId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const milestones = Array.isArray(snap.data().milestones) ? [...snap.data().milestones] : [];
  if (milestoneIndex < milestones.length) {
    milestones[milestoneIndex] = { ...milestones[milestoneIndex], completed };
  }
  await updateDoc(ref, { milestones });
}
