import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Brain,
  BookOpen,
  ArrowRight,
  Zap,
  ChevronRight,
  BarChart3,
  Clock,
  Award,
  Sparkles,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import useHabitsStore from "../../store/habitsStore";
import useTasksStore from "../../store/tasksStore";
import useGoalsStore from "../../store/goalsStore";
import useJournalStore from "../../store/journalStore";
import { calculateHealthScore, calculateStreaks } from "../../lib/analytics";
import { formatDateKey, getMonthId } from "../../lib/utils";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { LoadingSkeleton } from "../../components/ui/LoadingSpinner";

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};
const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};

function CountUp({ to, duration = 800, suffix = "" }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const target = Number(to) || 0;
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(target * ease));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to, duration]);
  return (
    <>
      {val}
      {suffix}
    </>
  );
}

function ArcProgress({
  value = 0,
  size = 120,
  stroke = 8,
  color = "#4facfe",
  trackColor = "rgba(255,255,255,0.06)",
  label,
  sublabel,
}) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const arcFrac = 0.75;
  const dashArr = circ * arcFrac;
  const dashOff = circ * arcFrac * (1 - pct / 100);
  const rotate = 135;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        style={{
          transform: `rotate(${rotate}deg)`,
          position: "absolute",
          inset: 0,
        }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dashArr} ${circ}`}
          strokeDashoffset={0}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dashArr} ${circ}`}
          strokeDashoffset={dashOff}
          style={{
            transition:
              "stroke-dashoffset 1.1s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        />
      </svg>
      <div className="relative flex flex-col items-center z-10">
        {label !== undefined && (
          <span className="text-2xl font-bold text-white leading-none">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-[10px] text-gray-500 mt-0.5 leading-none">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

function ProgressBar({
  value = 0,
  color = "#4facfe",
  height = 3,
  className = "",
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(Math.max(0, Math.min(100, value))), 80);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div
      className={`rounded-full overflow-hidden ${className}`}
      style={{ height, background: "rgba(255,255,255,0.06)" }}
    >
      <div
        style={{
          width: `${width}%`,
          height: "100%",
          background: color,
          borderRadius: 9999,
          transition: "width 0.9s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}
      />
    </div>
  );
}

function Sparkline({ data = [], color = "#4facfe", height = 28 }) {
  if (data.length < 2) return null;
  const W = 80;
  const H = height;
  const max = Math.max(...data, 1);
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - (v / max) * (H - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient
          id={`sg-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScorePill({ label, value, color, display }) {
  const colorMap = {
    green: { text: "text-green-400", bg: "bg-green-500/10", bar: "#22c55e" },
    blue: { text: "text-blue-400", bg: "bg-blue-500/10", bar: "#4facfe" },
    yellow: { text: "text-yellow-400", bg: "bg-yellow-500/10", bar: "#eab308" },
    purple: { text: "text-purple-400", bg: "bg-purple-500/10", bar: "#a855f7" },
    orange: { text: "text-orange-400", bg: "bg-orange-500/10", bar: "#f97316" },
  };
  const c = colorMap[color] ?? colorMap.blue;
  return (
    <div className={`rounded-lg px-3 py-2 ${c.bg} flex flex-col gap-1.5`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-500">{label}</span>
        <span className={`text-xs font-semibold ${c.text}`}>
          {display ?? value}
        </span>
      </div>
      <ProgressBar value={value} color={c.bar} height={2} />
    </div>
  );
}

function StreakRow({ habit, streak, max, index }) {
  const pct = max > 0 ? (streak / max) * 100 : 0;
  const colors = ["#4facfe", "#22c55e", "#f97316", "#a855f7", "#eab308"];
  const color = colors[index % colors.length];
  return (
    <motion.div variants={fadeUp} className="group flex items-center gap-3">
      <div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: color }}
      />
      <span className="text-xs text-gray-400 truncate flex-1 group-hover:text-gray-200 transition-colors">
        {habit}
      </span>
      <ProgressBar
        value={pct}
        color={color}
        height={2}
        className="w-16 shrink-0"
      />
      <span className="text-xs font-semibold text-white tabular-nums w-8 text-right shrink-0">
        {streak}d
      </span>
    </motion.div>
  );
}

function TaskItem({ task, index }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex items-start gap-2.5 py-1.5 group"
    >
      <div
        className={`mt-0.5 w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center transition-all ${
          task.done
            ? "bg-green-500/20 border-green-500/50"
            : "border-surface-500/50 group-hover:border-primary-500/50"
        }`}
      >
        {task.done && <div className="w-1.5 h-1.5 rounded-full bg-green-400" />}
      </div>
      <span
        className={`text-xs leading-relaxed ${task.done ? "line-through text-gray-600" : "text-gray-300"}`}
      >
        {task.title ?? task.text ?? task.name ?? "Task"}
      </span>
    </motion.div>
  );
}

function GoalCard({ goal, index }) {
  const ms = Array.isArray(goal.milestones) ? goal.milestones : [];
  const done = ms.filter((m) => m.completed).length;
  const total = ms.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const colors = ["#4facfe", "#22c55e", "#f97316", "#a855f7"];
  const color = colors[index % colors.length];

  return (
    <motion.div
      variants={fadeUp}
      className="flex items-center gap-3 py-1.5 group"
    >
      <ArcProgress
        value={pct}
        size={36}
        stroke={3.5}
        color={color}
        label={<span className="text-[9px] font-bold text-white">{pct}%</span>}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-300 truncate group-hover:text-white transition-colors">
          {goal.title ?? goal.name ?? "Goal"}
        </p>
        <p className="text-[10px] text-gray-600">
          {done}/{total} milestones
        </p>
      </div>
    </motion.div>
  );
}

function DateBanner({ user }) {
  const now = new Date();
  const hour = now.getHours();
  const greet =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name =
    user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "";
  const dayStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      variants={fadeUp}
      className="flex items-end justify-between flex-wrap gap-2"
    >
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight">
          {greet}
          {name ? `, ${name}` : ""}
          <span className="text-gray-600">.</span>
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Let's keep the momentum going!
        </p>
      </div>
    </motion.div>
  );
}

function Dashboard() {
  const { user } = useAuthStore();
  const { habits, fetchHabits } = useHabitsStore();
  const { tasks, fetchTasks } = useTasksStore();
  const { goals, fetchGoals } = useGoalsStore();
  const { entries, fetchEntries } = useJournalStore();
  const [loaded, setLoaded] = useState(false);

  const today = useMemo(() => new Date(), []);
  const thirtyDaysAgo = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 30);
    return d;
  }, [today]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchHabits(user.uid, today),
      fetchTasks(user.uid, today),
      fetchGoals(user.uid),
      fetchEntries(user.uid),
    ]).then(() => setLoaded(true));
  }, [user]);

  const healthScore = useMemo(() => {
    if (!habits.length) return null;
    return calculateHealthScore(habits, thirtyDaysAgo, today);
  }, [habits]);

  const { currentStreaks, longestStreaks } = useMemo(() => {
    if (!habits.length) return { currentStreaks: [], longestStreaks: [] };
    return calculateStreaks(habits, thirtyDaysAgo, today);
  }, [habits]);

  const doneTasks = tasks.filter((t) => t.done);
  const pendingTasks = tasks.filter((t) => !t.done);
  const taskPct =
    tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  const activeGoals = goals.filter((g) =>
    Array.isArray(g.milestones) ? g.milestones.some((m) => !m.completed) : true,
  );
  const totalMilestones = goals.reduce(
    (s, g) => s + (Array.isArray(g.milestones) ? g.milestones.length : 0),
    0,
  );
  const doneMilestones = goals.reduce(
    (s, g) =>
      s +
      (Array.isArray(g.milestones)
        ? g.milestones.filter((m) => m.completed).length
        : 0),
    0,
  );
  const goalPct =
    totalMilestones > 0
      ? Math.round((doneMilestones / totalMilestones) * 100)
      : 0;

  const aggregateStreak = useMemo(() => {
    const top = [...currentStreaks].sort((a, b) => b.streak - a.streak);
    return top.length > 0 ? top[0].streak : 0;
  }, [currentStreaks]);
  const journalCount = entries.filter((e) => {
    const d = new Date(e.createdAt?.toDate?.() ?? e.createdAt);
    return d >= thirtyDaysAgo;
  }).length;

  const score = healthScore?.overall ?? 0;
  const scoreColor =
    score >= 75
      ? "#22c55e"
      : score >= 50
        ? "#4facfe"
        : score >= 25
          ? "#f97316"
          : "#ef4444";

  const scoreGrade =
    score >= 90
      ? "Excellent"
      : score >= 75
        ? "Good"
        : score >= 50
          ? "Fair"
          : score >= 25
            ? "Needs Work"
            : "Getting Started";

  const completionRate = useMemo(() => {
    if (!habits.length) return 0;
    let done = 0,
      total = 0;
    const d = new Date(thirtyDaysAgo);
    while (d <= today) {
      const key = formatDateKey(d);
      habits.forEach((h) => {
        if (h.days && key in h.days) {
          total++;
          if (h.days[key]) done++;
        }
      });
      d.setDate(d.getDate() + 1);
    }
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [habits, thirtyDaysAgo, today]);

  const activeDays = useMemo(() => {
    if (!habits.length) return 0;
    let days = 0;
    const d = new Date(thirtyDaysAgo);
    while (d <= today) {
      const key = formatDateKey(d);
      if (habits.some((h) => h.days && h.days[key])) days++;
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [habits, thirtyDaysAgo, today]);

  const momentum = useMemo(() => {
    const imp = healthScore?.improvement ?? 0;
    if (imp > 3)
      return { label: "↑ Improving", value: Math.min(100, 50 + imp * 3) };
    if (imp < -3)
      return { label: "↓ Slipping", value: Math.max(0, 50 + imp * 3) };
    return { label: "→ Steady", value: 50 };
  }, [healthScore]);

  if (!loaded) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <LoadingSkeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <LoadingSkeleton className="h-64 rounded-xl lg:col-span-2" />
          <LoadingSkeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      <DateBanner user={user} />

      <motion.div
        variants={fadeIn}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <motion.div
          variants={fadeUp}
          className="col-span-2 relative overflow-hidden rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:gap-5 items-center sm:items-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(79,172,254,0.08) 0%, rgba(0,242,254,0.04) 100%)",
            border: "1px solid rgba(79,172,254,0.15)",
          }}
        >
          <div
            className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${scoreColor}18 0%, transparent 70%)`,
            }}
          />

          <ArcProgress
            value={score}
            size={86}
            stroke={7}
            color={scoreColor}
            label={<CountUp to={score} />}
            sublabel="/100"
          />

          <div className="flex-1 min-w-0 w-full">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">
              Health Score
            </p>
            <p
              className="text-xs font-medium mb-3"
              style={{ color: scoreColor }}
            >
              {scoreGrade}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <ScorePill
                label="Completion"
                value={completionRate}
                display={`${completionRate}%`}
                color="blue"
              />
              <ScorePill
                label="Best Streak"
                value={Math.min((aggregateStreak / 30) * 100, 100)}
                display={`${aggregateStreak}d`}
                color="orange"
              />
              <ScorePill
                label="Active Days"
                value={Math.round((activeDays / 30) * 100)}
                display={`${activeDays}/30`}
                color="green"
              />
              <ScorePill
                label="Momentum"
                value={momentum.value}
                display={momentum.label}
                color="purple"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="rounded-2xl p-4 sm:p-5 flex flex-col relative"
          style={{
            background:
              "linear-gradient(135deg,rgba(249,115,22,0.14),rgba(249,115,22,0.03))",
            border: "1px solid rgba(249,115,22,0.18)",
          }}
        >
          {aggregateStreak > 0 && (
            <div
              className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle,rgba(249,115,22,0.12),transparent 70%)",
              }}
            />
          )}
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center relative shrink-0"
                  style={{ background: "rgba(249,115,22,0.12)" }}
                >
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
                  {aggregateStreak > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  )}
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 leading-none flex items-center gap-1">
                    Active streak
                    <span className="relative group">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-600"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <path d="M12 17h.01" />
                      </svg>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-52 pointer-events-none">
                        <div className="bg-surface-900 border border-surface-600/50 rounded-lg shadow-xl px-3 py-2 text-[9px] leading-relaxed text-gray-300">
                          Tracks consecutive days with at least one completed
                          habit. Streak resets after a day with no completions
                          (This streak is different from the one in analytics
                          tab.)
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-surface-800" />
                        </div>
                      </div>
                    </span>
                  </div>
                  <p className="text-xl font-bold text-white leading-none mt-0.5">
                    <CountUp to={aggregateStreak} />
                    <span className="text-sm font-normal text-gray-500 ml-0.5">
                      days
                    </span>
                  </p>
                </div>
              </div>
              {aggregateStreak >= 3 && (
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(249,115,22,0.1)",
                    border: "1px solid rgba(249,115,22,0.2)",
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <span className="text-[9px] text-orange-400 font-medium">
                    x{aggregateStreak}
                  </span>
                </div>
              )}
            </div>
            {(() => {
              const best = [...currentStreaks].sort(
                (a, b) => b.streak - a.streak,
              )[0];
              if (!best || best.streak === 0) return null;
              return (
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "#f97316" }}
                  />
                  <p className="text-[10px] text-gray-400 truncate">
                    {best.habit} — {best.streak}d
                  </p>
                </div>
              );
            })()}
            <div className="h-1 bg-surface-700/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min((aggregateStreak / 30) * 100, 100)}%`,
                  background: "linear-gradient(90deg,#fb923c,#f97316,#ef4444)",
                }}
              />
            </div>
            <p className="text-[9px] text-gray-600 mt-1">
              {aggregateStreak === 0
                ? "No active streak"
                : aggregateStreak < 7
                  ? "Building momentum — keep going!"
                  : aggregateStreak < 14
                    ? "Strong rhythm — you're on a roll!"
                    : "Unstoppable! This is legendary."}
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="rounded-2xl p-4 sm:p-5 flex flex-col justify-between"
          style={{
            background:
              "linear-gradient(135deg,rgba(34,197,94,0.09),rgba(34,197,94,0.03))",
            border: "1px solid rgba(34,197,94,0.16)",
          }}
        >
          <div className="flex items-center justify-between mb-3 min-w-0 gap-2">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(34,197,94,0.12)" }}
            >
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400" />
            </div>
            <span className="text-[10px] font-semibold text-green-500 shrink-0">
              {taskPct}%
            </span>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-white leading-none">
              <CountUp to={doneTasks.length} />
              <span className="text-sm text-gray-500 font-normal">
                /{tasks.length}
              </span>
            </p>
            <p className="text-[10px] text-gray-500 mt-1">Tasks done today</p>
            <ProgressBar
              value={taskPct}
              color="#22c55e"
              height={2}
              className="mt-2"
            />
          </div>
        </motion.div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-primary-400" />
              <span className="text-xs font-medium text-gray-300">
                Active Streaks
              </span>
            </div>
            <span className="text-[10px] text-gray-600">
              {currentStreaks.length} habits
            </span>
          </div>
          {currentStreaks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="h-8 w-8 text-gray-700 mb-2" />
              <p className="text-xs text-gray-600">
                Start tracking habits
                <br />
                to see your streaks here
              </p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-2.5"
            >
              {currentStreaks.slice(0, 6).map((s, i) => (
                <StreakRow
                  key={i}
                  habit={s.habit}
                  streak={s.streak}
                  max={aggregateStreak}
                  index={i}
                />
              ))}
              {currentStreaks.length > 6 && (
                <p className="text-[10px] text-gray-600 pt-1">
                  +{currentStreaks.length - 6} more habits
                </p>
              )}
            </motion.div>
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs font-medium text-gray-300">
                Today's Tasks
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] text-gray-600">
                {doneTasks.length} done
              </span>
            </div>
          </div>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-gray-700 mb-2" />
              <p className="text-xs text-gray-600">No tasks for today</p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-0 divide-y divide-white/[0.03]"
            >
              {pendingTasks.slice(0, 4).map((t, i) => (
                <TaskItem key={t.id ?? i} task={t} index={i} />
              ))}
              {doneTasks.slice(0, 3).map((t, i) => (
                <TaskItem key={t.id ?? `d${i}`} task={t} index={i} />
              ))}
              {tasks.length > 7 && (
                <p className="text-[10px] text-gray-600 pt-2">
                  +{tasks.length - 7} more tasks
                </p>
              )}
            </motion.div>
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs font-medium text-gray-300">Goals</span>
            </div>
            <span className="text-[10px] text-gray-600">
              {activeGoals.length} active
            </span>
          </div>

          <div className="flex items-center gap-2 mb-4 mt-2">
            <ProgressBar
              value={goalPct}
              color="#a855f7"
              height={3}
              className="flex-1"
            />
            <span className="text-[10px] font-semibold text-purple-400 tabular-nums">
              {goalPct}%
            </span>
          </div>

          {activeGoals.length === 0 && goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Target className="h-8 w-8 text-gray-700 mb-2" />
              <p className="text-xs text-gray-600">
                Set goals to track
                <br />
                your progress here
              </p>
            </div>
          ) : activeGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Award className="h-7 w-7 text-green-400 mb-2 stroke-[1.5]" />
              <p className="text-xs text-green-400 font-medium">
                All goals completed!
              </p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-1 divide-y divide-white/[0.03]"
            >
              {activeGoals.slice(0, 5).map((g, i) => (
                <GoalCard key={g.id ?? i} goal={g} index={i} />
              ))}
              {activeGoals.length > 5 && (
                <p className="text-[10px] text-gray-600 pt-2">
                  +{activeGoals.length - 5} more goals
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <motion.div
          variants={fadeUp}
          className="lg:col-span-2 glass-card rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs font-medium text-gray-300">Journal</span>
            </div>
            <span className="text-[10px] text-gray-600">last 30 days</span>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-3xl font-bold text-white">
                <CountUp to={journalCount} />
              </p>
              <p className="text-[10px] text-gray-500 mt-1">entries written</p>
            </div>
            <div className="flex-1 flex items-end gap-0.5 h-10">
              {Array.from({ length: 5 }, (_, wi) => {
                const weekStart = new Date(today);
                weekStart.setDate(
                  today.getDate() - (4 - wi) * 7 - today.getDay(),
                );
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                const count = entries.filter((e) => {
                  const d = new Date(e.createdAt?.toDate?.() ?? e.createdAt);
                  return d >= weekStart && d <= weekEnd;
                }).length;
                const maxW = 5;
                const h = Math.max(4, (count / Math.max(maxW, 1)) * 36);
                return (
                  <div
                    key={wi}
                    className="flex-1 rounded-sm transition-all"
                    style={{
                      height: h,
                      background:
                        count > 0
                          ? "rgba(79,172,254,0.5)"
                          : "rgba(255,255,255,0.05)",
                      alignSelf: "flex-end",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="lg:col-span-3 rounded-2xl p-5 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg,rgba(168,85,247,0.08),rgba(79,172,254,0.05))",
            border: "1px solid rgba(168,85,247,0.14)",
          }}
        >
          <div
            className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(168,85,247,0.15)" }}
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                Daily insights
              </span>
            </div>
            <InsightCards
              score={score}
              streak={aggregateStreak}
              taskPct={taskPct}
              journalCount={journalCount}
              pendingCount={pendingTasks.length}
              habits={habits}
              goals={goals}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function InsightCards({
  score,
  streak,
  taskPct,
  journalCount,
  pendingCount,
  habits,
  goals,
}) {
  const cards = useMemo(() => {
    const items = [];

    if (habits && habits.length > 0) {
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const allDone = habits.filter((h) => {
        let done = 0,
          total = 0;
        let d = new Date(weekAgo);
        while (d <= now) {
          const key = formatDateKey(d);
          if (h.days && key in h.days) {
            total++;
            if (h.days[key]) done++;
          }
          d.setDate(d.getDate() + 1);
        }
        return total > 0 && done / total >= 1;
      }).length;
      const totalHabits = habits.length;
      if (allDone === totalHabits && totalHabits > 0)
        items.push({
          icon: "check",
          label: "All habits on track",
          desc: `Every habit was completed daily this week. This level of consistency is where real progress compounds.`,
          color: "#22c55e",
        });

      const low = habits
        .map((h) => {
          let done = 0,
            total = 0;
          let d = new Date(weekAgo);
          while (d <= now) {
            const key = formatDateKey(d);
            if (h.days && key in h.days) {
              total++;
              if (h.days[key]) done++;
            }
            d.setDate(d.getDate() + 1);
          }
          return { name: h.name, pct: total > 0 ? done / total : 0 };
        })
        .filter((s) => s.pct > 0 && s.pct < 0.5)
        .sort((a, b) => a.pct - b.pct);
      if (low.length > 0)
        items.push({
          icon: "alert",
          label: "Needs attention",
          desc: `${low
            .slice(0, 2)
            .map((s) => s.name)
            .join(
              " and ",
            )} completed less than half the time this week. A focused push here will lift your overall score.`,
          color: "#f97316",
        });
    }

    if (goals && goals.length > 0) {
      const now = new Date();
      const upcoming = goals
        .filter((g) => g.targetDate)
        .map((g) => ({
          title: g.title,
          diff: Math.ceil(
            (new Date(g.targetDate) - now) / (1000 * 60 * 60 * 24),
          ),
        }))
        .filter((g) => g.diff >= 0 && g.diff <= 14)
        .sort((a, b) => a.diff - b.diff);
      const overdue = goals
        .filter((g) => g.targetDate)
        .map((g) => ({
          title: g.title,
          diff: Math.ceil(
            (new Date(g.targetDate) - now) / (1000 * 60 * 60 * 24),
          ),
        }))
        .filter((g) => g.diff < 0)
        .sort((a, b) => a.diff - b.diff);
      if (upcoming.length > 0) {
        const g = upcoming[0];
        items.push({
          icon: "deadline",
          label: g.diff === 0 ? "Due today" : "Deadline approaching",
          desc:
            g.diff === 0
              ? `"${g.title}" is due today. Check your milestones and wrap up remaining work.`
              : `"${g.title}" is due in ${g.diff} days. Review your milestones to stay on track.`,
          color: "#eab308",
        });
      }
      if (overdue.length > 0) {
        const g = overdue[0];
        items.push({
          icon: "overdue",
          label: "Overdue",
          desc: `"${g.title}" passed its target by ${Math.abs(g.diff)} days. Revise the timeline or break the next step into smaller tasks.`,
          color: "#ef4444",
        });
      }
    }

    if (score >= 75)
      items.push({
        icon: "heart",
        label: "Strong health score",
        desc: `Your ${score}/100 score reflects steady discipline. The real challenge is maintaining this when life gets busy.`,
        color: "#22c55e",
      });
    else if (score < 40)
      items.push({
        icon: "heart",
        label: "Room to grow",
        desc: `Your health score is ${score}/100. Small consistent steps — even one habit a day — rebuild momentum faster than you think.`,
        color: "#f97316",
      });

    if (streak >= 7)
      items.push({
        icon: "fire",
        label: `${streak}-day streak`,
        desc: `A streak this long means the behaviour is sticking. Protect it — even a minimal day keeps the chain alive.`,
        color: "#f97316",
      });
    else if (streak >= 3)
      items.push({
        icon: "fire",
        label: `${streak}-day streak`,
        desc: `Three days of consistency is the hardest part. You've crossed the threshold where habits start to feel automatic.`,
        color: "#fb923c",
      });
    else if (streak > 0)
      items.push({
        icon: "fire",
        label: `Day ${streak}`,
        desc: `Every streak starts with day one. Keep showing up — momentum builds faster than you expect.`,
        color: "#f97316",
      });

    if (taskPct === 100)
      items.push({
        icon: "task",
        label: "All tasks done",
        desc: `Every task completed. Use the freed mental space to review your goals or take a deliberate break.`,
        color: "#22c55e",
      });
    if (pendingCount > 5)
      items.push({
        icon: "task",
        label: `${pendingCount} tasks pending`,
        desc: `An open task list scatters focus. Pick the three most important and defer or delete the rest.`,
        color: "#4facfe",
      });

    if (journalCount === 0)
      items.push({
        icon: "journal",
        label: "No journal entries",
        desc: `Reflection turns experience into insight. Even three sentences a day can reveal patterns your numbers won't show.`,
        color: "#a855f7",
      });
    else if (journalCount > 10)
      items.push({
        icon: "journal",
        label: `${journalCount} entries this month`,
        desc: `Regular journaling builds self-awareness. You're tracking both the quantitative and qualitative sides of growth.`,
        color: "#a855f7",
      });

    if (items.length === 0)
      items.push({
        icon: "tip",
        label: "Stay consistent",
        desc: `Consistency beats intensity. Small daily habits compound into results that occasional marathons can't match.`,
        color: "#a855f7",
      });

    return items.slice(0, 4);
  }, [score, streak, taskPct, journalCount, pendingCount, habits, goals]);

  return (
    <div className="space-y-2.5">
      {cards.map((card, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-xl bg-surface-800/40 border border-white/[0.03] px-3.5 py-2.5"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${card.color}12` }}
          >
            <SvgIcon name={card.icon} color={card.color} />
          </div>
          <div className="min-w-0">
            <p
              className="text-xs font-medium text-white leading-none mb-1"
              style={{ color: card.color }}
            >
              {card.label}
            </p>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              {card.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SvgIcon({ name, color }) {
  const vb = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (name) {
    case "check":
      return (
        <svg {...vb}>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    case "alert":
      return (
        <svg {...vb}>
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "deadline":
      return (
        <svg {...vb}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "overdue":
      return (
        <svg {...vb}>
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
    case "heart":
      return (
        <svg {...vb}>
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      );
    case "fire":
      return (
        <svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
        </svg>
      );
    case "task":
      return (
        <svg {...vb}>
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      );
    case "journal":
      return (
        <svg {...vb}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      );
    default:
      return (
        <svg {...vb}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
}

export default Dashboard;
