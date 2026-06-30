import { formatDateKey } from './utils';

export function calculateHealthScore(habits, startDate, endDate) {
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  let consistencySum = 0, streakSum = 0;
  let firstHalfTotal = 0, firstHalfCompleted = 0;
  let secondHalfTotal = 0, secondHalfCompleted = 0;
  const midDate = new Date(startDate.getTime() + (endDate - startDate) / 2);

  habits.forEach(habit => {
    let completedDays = 0, streak = 0, maxStreak = 0, applicableDays = 0;
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const key = formatDateKey(currentDate);
      if (habit.createdAt && key < habit.createdAt) { currentDate.setDate(currentDate.getDate() + 1); continue; }
      applicableDays++;
      if (habit.days && habit.days[key]) {
        completedDays++;
        streak++;
        maxStreak = Math.max(maxStreak, streak);
        if (currentDate <= midDate) firstHalfCompleted++;
        else secondHalfCompleted++;
      } else {
        streak = 0;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    const totalForHabit = applicableDays || totalDays;
    firstHalfTotal += Math.ceil((midDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    secondHalfTotal += Math.ceil((endDate - midDate) / (1000 * 60 * 60 * 24));
    const ratio = totalForHabit > 0 ? completedDays / totalForHabit : 0;
    consistencySum += ratio;
    streakSum += maxStreak;
  });

  // Count perfect days — days where all applicable habits were completed
  let perfectDays = 0;
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const key = formatDateKey(currentDate);
    const applicable = habits.filter(h => !h.createdAt || key >= h.createdAt);
    if (applicable.length > 0 && applicable.every(h => h.days && h.days[key])) perfectDays++;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const n = habits.length || 1;
  const consistency = Math.round((consistencySum / n) * 40);
  const streak = Math.round(((streakSum / n) / totalDays) * 25);
  const perfection = Math.round((perfectDays / totalDays) * 20);

  const firstRate = firstHalfTotal > 0 ? firstHalfCompleted / firstHalfTotal : 0;
  const secondRate = secondHalfTotal > 0 ? secondHalfCompleted / secondHalfTotal : 0;
  let improvement = 0;
  if (firstRate > 0) {
    improvement = Math.round(((secondRate - firstRate) / firstRate) * 15);
    improvement = Math.max(-15, Math.min(15, improvement));
  }

  const overall = Math.min(100, Math.max(0, consistency + streak + perfection + improvement));

  return { overall, consistency, streak, perfection, improvement, perfectDays };
}

export function calculateStreaks(habits, startDate, endDate) {
  const current = new Date();

  const currentStreaks = habits.map(habit => {
    let streak = 0;
    let d = new Date(current);
    d.setDate(d.getDate() - 1);
    while (d >= startDate) {
      const key = formatDateKey(d);
      if (habit.createdAt && key < habit.createdAt) { d.setDate(d.getDate() - 1); continue; }
      if (habit.days && key in habit.days) {
        if (habit.days[key]) streak++;
        else break;
      } else {
        break;
      }
      d.setDate(d.getDate() - 1);
    }
    return { habit: habit.name, streak };
  });

  const longestStreaks = habits.map(habit => {
    let maxStreak = 0, streak = 0;
    let d = new Date(startDate);
    while (d <= endDate) {
      const key = formatDateKey(d);
      if (habit.createdAt && key < habit.createdAt) { d.setDate(d.getDate() + 1); continue; }
      if (habit.days && habit.days[key]) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 0;
      }
      d.setDate(d.getDate() + 1);
    }
    return { habit: habit.name, streak: maxStreak };
  });

  return { currentStreaks, longestStreaks };
}

export function getHabitCompletionData(habits, startDate, endDate) {
  const data = [];
  let d = new Date(startDate);
  while (d <= endDate) {
    const key = formatDateKey(d);
    const completed = habits.filter(h => h.days && h.days[key]).length;
    data.push({ date: key, completed, total: habits.length });
    d.setDate(d.getDate() + 1);
  }
  return data;
}

export function getMonthlyCompletions(habits, year) {
  const months = [];
  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    let completed = 0, total = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      habits.forEach(h => {
        total++;
        if (h.days && h.days[key]) completed++;
      });
    }
    months.push({
      month: new Date(year, m).toLocaleString('default', { month: 'short' }),
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  }
  return months;
}
