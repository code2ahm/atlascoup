import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { formatDateKey } from '../lib/utils';

function getTaskDocRef(uid, dateKey) {
  return doc(db, 'users', uid, 'taskdays', dateKey);
}

function getTemplateDocRef(uid) {
  return doc(db, 'users', uid, 'taskTemplates', 'data');
}

export async function getTasks(uid, date = new Date()) {
  const dateKey = formatDateKey(date);
  const snap = await getDoc(getTaskDocRef(uid, dateKey));

  if (snap.exists()) {
    return snap.data().tasks || [];
  }

  const templateSnap = await getDoc(getTemplateDocRef(uid));
  const templates = templateSnap.exists() ? (templateSnap.data().templates || []) : [];

  const tasks = templates.map((t, i) => ({
    id: Date.now().toString() + '_' + i,
    name: t.name,
    timeMin: t.timeMin || 25,
    repeatDaily: true,
    done: false,
    order: i,
  }));

  if (tasks.length > 0) {
    await setDoc(getTaskDocRef(uid, dateKey), { tasks });
  }

  return tasks;
}

export function subscribeTasks(uid, date, onData, onError = () => {}) {
  const dateKey = formatDateKey(date);
  return onSnapshot(getTaskDocRef(uid, dateKey), (snap) => {
    onData(snap.exists() ? (snap.data().tasks || []) : []);
  }, onError);
}

export async function saveTasks(uid, tasks, date = new Date()) {
  const dateKey = formatDateKey(date);
  await setDoc(getTaskDocRef(uid, dateKey), { tasks });

  const repeatTasks = tasks.filter(t => t.repeatDaily);
  await setDoc(getTemplateDocRef(uid), { templates: repeatTasks });
}

export async function saveTasksForDateRange(uid, tasksByDate) {
  const batchWrites = Object.entries(tasksByDate).map(([dateKey, tasks]) =>
    setDoc(getTaskDocRef(uid, dateKey), { tasks })
  );
  await Promise.all(batchWrites);
}
