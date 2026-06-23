import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  TrendingUp,
  Flame,
  Target,
  Activity,
  BarChart3,
  Award,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  Download,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { useToast } from "../../components/ui/Toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { LoadingSkeleton } from "../../components/ui/LoadingSpinner";
import { formatDateKey, getMonthId } from "../../lib/utils";
import { collection, getDocs, query, where, documentId } from "firebase/firestore";
import { db } from "../../lib/firebase";

const scoreLabels = [
  {
    min: 90,
    label: "Excellent",
    desc: "Outstanding consistency!",
    color: "green",
  },
  {
    min: 75,
    label: "Good",
    desc: "Solid performance. Keep it up!",
    color: "blue",
  },
  {
    min: 50,
    label: "Fair",
    desc: "Decent effort. Room to grow.",
    color: "yellow",
  },
  {
    min: 25,
    label: "Needs Work",
    desc: "Try to be more consistent.",
    color: "orange",
  },
  {
    min: 0,
    label: "Getting Started",
    desc: "Every day is a new start!",
    color: "red",
  },
];
function getScoreLabel(score) {
  return (
    scoreLabels.find((sl) => score >= sl.min) ??
    scoreLabels[scoreLabels.length - 1]
  );
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function dateKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd2 = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd2}`;
}
function fmtDate(key, opts = {}) {
  return new Date(key + "T00:00:00").toLocaleDateString("en-US", opts);
}

function FireIcon({ size = 40 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="-33 0 255 255"
      preserveAspectRatio="xMidYMid"
    >
      <defs>
        <style>{`.cls-3{fill:url(#lg1)}.cls-4{fill:#fc9502}.cls-5{fill:#fce202}`}</style>
        <linearGradient
          id="lg1"
          gradientUnits="userSpaceOnUse"
          x1="94.141"
          y1="255"
          x2="94.141"
          y2="0.188"
        >
          <stop offset="0" stopColor="#ff4c0d" />
          <stop offset="1" stopColor="#fc9502" />
        </linearGradient>
      </defs>
      <g>
        <path
          className="cls-3"
          fillRule="evenodd"
          d="M187.899,164.809 C185.803,214.868 144.574,254.812 94.000,254.812 C42.085,254.812 -0.000,211.312 -0.000,160.812 C-0.000,154.062 -0.121,140.572 10.000,117.812 C16.057,104.191 19.856,95.634 22.000,87.812 C23.178,83.513 25.469,76.683 32.000,87.812 C35.851,94.374 36.000,103.812 36.000,103.812 C36.000,103.812 50.328,92.817 60.000,71.812 C74.179,41.019 62.866,22.612 59.000,9.812 C57.662,5.384 56.822,-2.574 66.000,0.812 C75.352,4.263 100.076,21.570 113.000,39.812 C131.445,65.847 138.000,90.812 138.000,90.812 C138.000,90.812 143.906,83.482 146.000,75.812 C148.365,67.151 148.400,58.573 155.999,67.813 C163.226,76.600 173.959,93.113 180.000,108.812 C190.969,137.321 187.899,164.809 187.899,164.809 Z"
        />
        <path
          className="cls-4"
          fillRule="evenodd"
          d="M94.000,254.812 C58.101,254.812 29.000,225.711 29.000,189.812 C29.000,168.151 37.729,155.000 55.896,137.166 C67.528,125.747 78.415,111.722 83.042,102.172 C83.953,100.292 86.026,90.495 94.019,101.966 C98.212,107.982 104.785,118.681 109.000,127.812 C116.266,143.555 118.000,158.812 118.000,158.812 C118.000,158.812 125.121,154.616 130.000,143.812 C131.573,140.330 134.753,127.148 143.643,140.328 C150.166,150.000 159.127,167.390 159.000,189.812 C159.000,225.711 129.898,254.812 94.000,254.812 Z"
        />
        <path
          className="cls-5"
          fillRule="evenodd"
          d="M95.000,183.812 C104.250,183.812 104.250,200.941 116.000,223.812 C123.824,239.041 112.121,254.812 95.000,254.812 C77.879,254.812 69.000,240.933 69.000,223.812 C69.000,206.692 85.750,183.812 95.000,183.812 Z"
        />
      </g>
    </svg>
  );
}

function ScoreRing({ score, size = 88 }) {
  const clamped = Math.max(0, Math.min(100, score ?? 0));
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - clamped / 100);
  const label = getScoreLabel(clamped);
  const colors = {
    green: "#22c55e",
    blue: "#4facfe",
    yellow: "#eab308",
    orange: "#f97316",
    red: "#ef4444",
  };
  const stroke = colors[label?.color] ?? "#4facfe";
  return (
    <div
      className="relative inline-flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 absolute inset-0"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="6"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s ease-out",
            filter: `drop-shadow(0 0 6px ${stroke}88)`,
          }}
        />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span className="text-xl font-bold text-white leading-none">
          {clamped}
        </span>
        <span className="text-[9px] text-gray-500 leading-none mt-0.5">
          /100
        </span>
      </div>
    </div>
  );
}

function TrendArrow({ value }) {
  if (value > 2) return <ArrowUp className="h-3 w-3 text-green-400" />;
  if (value < -2) return <ArrowDown className="h-3 w-3 text-red-400" />;
  return <Minus className="h-3 w-3 text-gray-500" />;
}

function StatPill({ label, value, accent }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-2 rounded-xl"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <span className="text-[11px] text-gray-500 leading-none mb-1">
        {label}
      </span>
      <span
        className="text-lg font-bold leading-none"
        style={{ color: accent ?? "#fff" }}
      >
        {value}
      </span>
    </div>
  );
}

function GithubCalendar({ data, taskData }) {
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const CELL = 12,
    GAP = 3,
    STEP = 15,
    WEEKS = 53;

  const { weeks } = useMemo(() => {
    const lastSun = new Date(today);
    lastSun.setDate(today.getDate() - today.getDay());
    const firstSun = addDays(lastSun, -(52 * 7));
    const wks = [];
    let cursor = new Date(firstSun);
    for (let w = 0; w < WEEKS; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        days.push(new Date(cursor));
        cursor = addDays(cursor, 1);
      }
      wks.push(days);
    }
    return { weeks: wks };
  }, [today]);

  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    weeks.forEach((wk, wi) => {
      const m = wk[0].getMonth();
      if (m !== lastMonth) {
        labels.push({
          wi,
          label: wk[0].toLocaleDateString("en-US", { month: "short" }),
        });
        lastMonth = m;
      }
    });
    return labels;
  }, [weeks]);

  const todayKey = dateKey(today);

  function cellColor(date) {
    const k = dateKey(date);
    const dd = data[k];
    if (date > today) return "rgba(255,255,255,0.02)";
    if (!dd || dd.total === 0) return "var(--heatmap-empty,#1e2535)";
    const pct = dd.done / dd.total;
    if (pct >= 1) return "var(--heatmap-l4,#22c55e)";
    if (pct >= 0.75) return "var(--heatmap-l3,rgba(34,197,94,0.7))";
    if (pct >= 0.5) return "var(--heatmap-l2,rgba(34,197,94,0.45))";
    if (pct >= 0.25) return "var(--heatmap-l1,rgba(34,197,94,0.25))";
    return "var(--heatmap-l0,rgba(34,197,94,0.12))";
  }

  const svgW = WEEKS * STEP,
    svgH = 22 + 7 * STEP;
  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  function handleSvgMouseMove(e) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = svgW / rect.width,
      scaleY = svgH / rect.height;
    const svgX = (e.clientX - rect.left) * scaleX,
      svgY = (e.clientY - rect.top) * scaleY;
    const wi = Math.floor(svgX / STEP),
      di = Math.floor((svgY - 22) / STEP);
    if (wi < 0 || wi >= WEEKS || di < 0 || di >= 7) {
      setTooltip(null);
      return;
    }
    const date = weeks[wi]?.[di];
    if (!date) {
      setTooltip(null);
      return;
    }
    const k = dateKey(date);
    setTooltip({
      key: k,
      date,
      clientX: e.clientX - rect.left,
      clientY: e.clientY - rect.top,
      rectW: rect.width,
    });
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div
        className="flex gap-2 items-start"
        style={{ minWidth: "max-content" }}
      >
        <div className="flex flex-col pt-[22px]" style={{ gap: GAP }}>
          {dayLabels.map((l, i) => (
            <div
              key={i}
              style={{
                width: 24,
                height: CELL,
                fontSize: 9,
                color: "rgba(156,163,175,0.55)",
                lineHeight: `${CELL}px`,
                textAlign: "right",
                paddingRight: 3,
              }}
            >
              {l}
            </div>
          ))}
        </div>
        <div className="relative">
          <svg
            ref={svgRef}
            width={svgW}
            height={svgH}
            style={{ display: "block", fontFamily: "inherit" }}
            onMouseMove={handleSvgMouseMove}
            onMouseLeave={() => setTooltip(null)}
          >
            {monthLabels.map(({ wi, label }) => (
              <text
                key={`${wi}-${label}`}
                x={wi * STEP}
                y={13}
                fontSize={9}
                fill="rgba(156,163,175,0.65)"
                fontFamily="inherit"
              >
                {label}
              </text>
            ))}
            {weeks.map((wk, wi) =>
              wk.map((date, di) => {
                const k = dateKey(date);
                return (
                  <rect
                    key={k}
                    x={wi * STEP}
                    y={22 + di * STEP}
                    width={CELL}
                    height={CELL}
                    rx={2.5}
                    fill={cellColor(date)}
                    stroke={k === todayKey ? "rgba(255,255,255,0.6)" : "none"}
                    strokeWidth={k === todayKey ? 1.5 : 0}
                    style={{ cursor: date > today ? "default" : "pointer" }}
                  />
                );
              }),
            )}
          </svg>
          {tooltip &&
            (() => {
              const d = data[tooltip.key],
                td = taskData?.[tooltip.key];
              const taskDone = Array.isArray(td)
                ? td.filter((t) => t.done).length
                : 0;
              const taskTotal = Array.isArray(td) ? td.length : 0;
              if (tooltip.date > today) return null;
              const pctLeft = tooltip.clientX / tooltip.rectW > 0.7;
              return (
                <div
                  className="cell-tooltip absolute z-20 pointer-events-none rounded-xl shadow-2xl px-3 py-2.5 text-[10px] leading-relaxed backdrop-blur-md"
                  style={{
                    left: pctLeft ? "auto" : tooltip.clientX + 10,
                    right: pctLeft
                      ? tooltip.rectW - tooltip.clientX + 6
                      : "auto",
                    top: Math.max(0, tooltip.clientY - 20),
                    minWidth: 150,
                    whiteSpace: "nowrap",
                    background: "rgba(10,12,20,0.92)",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}
                >
                  <p className="text-gray-200 font-semibold mb-1.5">
                    {fmtDate(tooltip.key, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  {d && d.total > 0 ? (
                    <p className="text-green-400">
                      Habits:{" "}
                      <span className="font-medium">
                        {d.done}/{d.total}
                      </span>
                      <span className="text-gray-500 ml-1">
                        ({Math.round((d.done / d.total) * 100)}%)
                      </span>
                    </p>
                  ) : (
                    <p className="text-gray-600">No habits tracked</p>
                  )}
                  {taskTotal > 0 ? (
                    <p className="text-blue-400">
                      Tasks:{" "}
                      <span className="font-medium">
                        {taskDone}/{taskTotal}
                      </span>
                    </p>
                  ) : (
                    <p className="text-gray-600">No tasks</p>
                  )}
                </div>
              );
            })()}
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-3 justify-end text-[9px] text-gray-600">
        <span>Less</span>
        {[
          "var(--heatmap-empty,#1e2535)",
          "var(--heatmap-l0,rgba(34,197,94,0.12))",
          "var(--heatmap-l1,rgba(34,197,94,0.25))",
          "var(--heatmap-l2,rgba(34,197,94,0.45))",
          "var(--heatmap-l3,rgba(34,197,94,0.7))",
          "var(--heatmap-l4,#22c55e)",
        ].map((c, i) => (
          <div
            key={i}
            style={{
              width: CELL,
              height: CELL,
              borderRadius: 2.5,
              background: c,
              flexShrink: 0,
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

function LineChart({ habitData, taskData, days }) {
  const ref = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const sorted = useMemo(() => [...days].sort(), [days]);

  const series = useMemo(
    () =>
      sorted.map((d, i) => {
        const h = habitData[d];
        const habitPct = h && h.total > 0 ? (h.done / h.total) * 100 : null;
        const taskArr = Array.isArray(taskData[d]) ? taskData[d] : [];
        const taskDone = taskArr.filter((t) => t.done).length;
        const taskTotal = taskArr.length;
        const win = sorted.slice(Math.max(0, i - 6), i + 1);
        const valid = win
          .map((k) => {
            const hh = habitData[k];
            return hh && hh.total > 0 ? (hh.done / hh.total) * 100 : null;
          })
          .filter((v) => v !== null);
        const rollAvg =
          valid.length > 0
            ? valid.reduce((a, b) => a + b, 0) / valid.length
            : null;
        return { key: d, habitPct, taskDone, taskTotal, rollAvg };
      }),
    [sorted, habitData, taskData],
  );

  const hasData = series.some((s) => s.habitPct !== null);
  if (!hasData || series.length < 2)
    return (
      <p className="text-xs text-gray-600 text-center py-8">
        No habit data for this period
      </p>
    );

  const W = 640,
    H = 220,
    PL = 36,
    PR = 12,
    PT = 14,
    PB = 30;
  const chartW = W - PL - PR,
    chartH = H - PT - PB;
  const xScale = (i) => PL + (i / (series.length - 1)) * chartW;
  const yScale = (v) => PT + chartH - (v / 100) * chartH;

  function buildPath(acc) {
    let d = "";
    series.forEach((s, i) => {
      const v = acc(s);
      if (v === null) return;
      const x = xScale(i),
        y = yScale(v);
      d += d === "" ? `M ${x} ${y}` : `L ${x} ${y}`;
    });
    return d;
  }
  function buildArea() {
    const pts = series.map((s, i) => ({
      x: xScale(i),
      y: yScale(s.habitPct ?? 0),
      ok: s.habitPct !== null,
    }));
    let d = "";
    pts.forEach((p) => {
      if (!p.ok) return;
      d += d === "" ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`;
    });
    if (!d) return "";
    const fi = pts.findIndex((p) => p.ok);
    const li = pts
      .map((p, i) => (p.ok ? i : -1))
      .filter((i) => i >= 0)
      .at(-1);
    return (
      d + ` L ${xScale(li)} ${PT + chartH} L ${xScale(fi)} ${PT + chartH} Z`
    );
  }

  const labelCount = Math.min(6, series.length);
  const labelIndexes = Array.from({ length: labelCount }, (_, i) =>
    Math.round((i * (series.length - 1)) / (labelCount - 1)),
  );

  function handleMouseMove(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const relX = svgX - PL;
    if (relX < 0 || relX > chartW) {
      setTooltip(null);
      return;
    }
    const idx = Math.round((relX / chartW) * (series.length - 1));
    const s = series[Math.max(0, Math.min(series.length - 1, idx))];
    setTooltip({
      idx,
      s,
      x: xScale(Math.max(0, Math.min(series.length - 1, idx))),
    });
  }

  const areaPath = buildArea(),
    habitPath = buildPath((s) => s.habitPct),
    rollAvgPath = buildPath((s) => s.rollAvg);

  return (
    <div className="relative select-none">
      <div className="flex flex-wrap gap-3 mb-3 text-[10px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-4 rounded"
            style={{ background: "#4facfe", height: 2 }}
          />
          Habit %
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-4"
            style={{ height: 2, borderTop: "2px dashed #a855f7" }}
          />
          7-day avg
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: "#f97316" }}
          />
          Tasks done
        </span>
      </div>

      <div
        style={{
          width: "100%",
          aspectRatio: `${W}/${H}`,
          minHeight: 200,
          position: "relative",
        }}
      >
        <svg
          ref={ref}
          viewBox={`0 0 ${W} ${H}`}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            cursor: "crosshair",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
        >
          <defs>
            <linearGradient id="lc-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4facfe" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#4facfe" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {[0, 25, 50, 75, 100].map((tick) => (
            <g key={tick}>
              <line
                x1={PL}
                y1={yScale(tick)}
                x2={W - PR}
                y2={yScale(tick)}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
              />
              <text
                x={PL - 4}
                y={yScale(tick)}
                textAnchor="end"
                dominantBaseline="central"
                fontSize={7}
                fill="rgba(156,163,175,0.75)"
              >
                {tick}
              </text>
            </g>
          ))}
          {areaPath && <path d={areaPath} fill="url(#lc-area)" />}
          {habitPath && (
            <path
              d={habitPath}
              fill="none"
              stroke="#4facfe"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {rollAvgPath && (
            <path
              d={rollAvgPath}
              fill="none"
              stroke="#a855f7"
              strokeWidth="1.5"
              strokeDasharray="5 3"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0.7"
            />
          )}
          {series.map(
            (s, i) =>
              s.taskDone > 0 && (
                <circle
                  key={s.key}
                  cx={xScale(i)}
                  cy={PT + chartH + 5}
                  r={Math.min(4.5, 1.5 + s.taskDone * 0.6)}
                  fill="#f97316"
                  opacity="0.8"
                />
              ),
          )}
          {labelIndexes.map((i) => (
            <text
              key={i}
              x={xScale(i)}
              y={H - 4}
              textAnchor="middle"
              fontSize={7}
              fill="rgba(156,163,175,0.75)"
            >
              {fmtDate(series[i].key, { month: "short", day: "numeric" })}
            </text>
          ))}
          {tooltip && (
            <>
              <line
                x1={tooltip.x}
                y1={PT}
                x2={tooltip.x}
                y2={PT + chartH}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
                strokeDasharray="3 2"
              />
              {tooltip.s.habitPct !== null && (
                <circle
                  cx={tooltip.x}
                  cy={yScale(tooltip.s.habitPct)}
                  r={4}
                  fill="#4facfe"
                  stroke="rgba(0,0,0,0.5)"
                  strokeWidth="1.5"
                />
              )}
            </>
          )}
        </svg>

        {tooltip && (
          <div
            className="chart-tooltip absolute pointer-events-none rounded-xl px-2.5 py-2 text-[10px] leading-relaxed z-10 shadow-2xl"
            style={{
              left: `${(tooltip.x / W) * 100}%`,
              top: 20,
              transform:
                tooltip.idx > series.length * 0.7
                  ? "translateX(-110%)"
                  : "translateX(10px)",
              whiteSpace: "nowrap",
              background: "rgba(8,10,18,0.93)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            <p className="text-gray-200 font-semibold mb-1">
              {fmtDate(tooltip.s.key, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
            {tooltip.s.habitPct !== null ? (
              <p className="text-blue-300">
                Habits: {Math.round(tooltip.s.habitPct)}%
                {tooltip.s.rollAvg !== null && (
                  <span className="text-gray-500 ml-1">
                    (7d avg {Math.round(tooltip.s.rollAvg)}%)
                  </span>
                )}
              </p>
            ) : (
              <p className="text-gray-600">No habit data</p>
            )}
            <p className="text-orange-400">
              Tasks: {tooltip.s.taskDone}/{tooltip.s.taskTotal}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreBreakdownCard({
  label,
  value,
  weight,
  color,
  bgColor,
  icon: Icon,
  iconColor,
  trend,
  description,
}) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.04] bg-surface-800 shadow-[0_10px_30px_rgba(0,0,0,0.45)] p-4">
      <div className={`absolute inset-0 opacity-[0.035] ${bgColor}`} />
      <div className="relative flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg ${bgColor} flex items-center justify-center`}
          >
            <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 leading-none">{label}</p>
            <p className="text-xs text-gray-600 leading-none mt-0.5">
              {weight}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <TrendArrow value={trend} />
          <span className={`text-lg font-bold ${iconColor}`}>
            {value}
            <span className="text-xs font-normal text-gray-600">%</span>
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-surface-700/60 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
          style={{ width: animated ? `${Math.min(100, value)}%` : "0%" }}
        />
      </div>
      <p className="text-[9px] text-gray-600">{description}</p>
    </div>
  );
}

function buildReportHtml(
  stats,
  period,
  allHabits,
  allTaskDays,
  goals,
  scoreLabel,
) {
  const now = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const rangeLabel =
    period === "7d"
      ? "Last 7 Days"
      : period === "28d"
        ? "Last 28 Days"
        : "All Time";
  const calRows = [];
  for (let i = 29; i >= 0; i--) {
    const d = addDays(new Date(), -i),
      k = dateKey(d),
      hd = allHabits[k],
      td = allTaskDays[k];
    const pct =
      hd && hd.total > 0 ? Math.round((hd.done / hd.total) * 100) : null;
    const taskDone = Array.isArray(td) ? td.filter((t) => t.done).length : 0;
    const bg =
      pct === null
        ? "#1e2030"
        : pct >= 100
          ? "#22c55e"
          : pct >= 75
            ? "rgba(34,197,94,0.6)"
            : pct >= 50
              ? "rgba(34,197,94,0.38)"
              : "rgba(34,197,94,0.2)";
    calRows.push({
      k,
      d,
      pct,
      taskDone,
      bg,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
  }
  const calCells = calRows
    .map(
      (r) => `<div class="cal-cell" style="background:${r.bg}" title="${r.k}">
    <span class="cal-date">${r.d.getDate()}</span>
    ${r.pct !== null ? `<span class="cal-pct">${r.pct}%</span>` : ""}
  </div>`,
    )
    .join("");
  const metrics = [
    {
      label: "Health Score",
      value: stats.healthScore + "/100",
      color: "#4facfe",
    },
    { label: "Consistency", value: stats.consistency + "%", color: "#4facfe" },
    {
      label: "Current Streak",
      value: stats.streak + " days",
      color: "#f97316",
    },
    {
      label: "Longest Streak",
      value: stats.longestStreak + " days",
      color: "#f97316",
    },
    { label: "Perfection", value: stats.perfection + "%", color: "#22c55e" },
    { label: "Active Days", value: stats.activeDays, color: "#a855f7" },
    { label: "Tasks Done", value: stats.tasksCompleted, color: "#38bdf8" },
    { label: "Goals Done", value: stats.goalsCompleted, color: "#eab308" },
  ];
  const metricsHtml = metrics
    .map(
      (m) =>
        `<div class="metric-card"><div class="metric-val" style="color:${m.color}">${m.value}</div><div class="metric-lbl">${m.label}</div></div>`,
    )
    .join("");
  const breakdownHtml = [
    { label: "Consistency (40%)", value: stats.consistency, color: "#4facfe" },
    { label: "Streak (25%)", value: stats.streakPct, color: "#f97316" },
    { label: "Perfection (20%)", value: stats.perfection, color: "#22c55e" },
    { label: "Improvement (15%)", value: stats.improvement, color: "#a855f7" },
  ]
    .map(
      (b) =>
        `<div class="bar-row"><span class="bar-lbl">${b.label}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, b.value)}%;background:${b.color}"></div></div><span class="bar-val">${b.value}%</span></div>`,
    )
    .join("");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Analytics Report — ${now}</title><style>*{box-sizing:border-box;margin:0;padding:0}body{background:#0f1117;color:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:40px;max-width:900px;margin:0 auto}h1{font-size:24px;font-weight:700;color:#fff;margin-bottom:4px}.subtitle{font-size:13px;color:#6b7280;margin-bottom:32px}.section{margin-bottom:32px}.section-title{font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.06)}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.metric-card{background:#1a1d2e;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px}.metric-val{font-size:22px;font-weight:700;margin-bottom:4px}.metric-lbl{font-size:11px;color:#6b7280}.cal-grid{display:grid;grid-template-columns:repeat(10,1fr);gap:4px}.cal-cell{border-radius:4px;padding:6px 4px;text-align:center;background:#1e2030}.cal-date{display:block;font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:2px}.cal-pct{display:block;font-size:9px;color:rgba(255,255,255,0.8);font-weight:600}.bar-row{display:flex;align-items:center;gap:12px;margin-bottom:12px}.bar-lbl{font-size:11px;color:#9ca3af;width:160px;flex-shrink:0}.bar-track{flex:1;height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden}.bar-fill{height:100%;border-radius:3px}.bar-val{font-size:11px;color:#e2e8f0;width:36px;text-align:right;flex-shrink:0}.score-badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;background:rgba(79,172,254,0.15);color:#4facfe;border:1px solid rgba(79,172,254,0.3);margin-left:10px}.footer{margin-top:40px;font-size:10px;color:#374151;text-align:center}@media print{body{background:#fff;color:#111;padding:24px}.metric-card{background:#f3f4f6;border-color:#e5e7eb}.bar-track{background:#e5e7eb}.cal-cell{border:1px solid #e5e7eb}h1,.metric-val{color:#111}.subtitle,.bar-lbl,.metric-lbl{color:#6b7280}.section-title{color:#6b7280;border-color:#e5e7eb}}</style></head><body>
  <h1>Analytics Report <span class="score-badge">${scoreLabel?.label ?? ""}</span></h1>
  <div class="subtitle">Generated ${now} · Period: ${rangeLabel}</div>
  <div class="section"><div class="section-title">Key Metrics</div><div class="metrics">${metricsHtml}</div></div>
  <div class="section"><div class="section-title">Last 30 Days — Habit Completion</div><div class="cal-grid">${calCells}</div></div>
  <div class="section"><div class="section-title">Score Breakdown</div>${breakdownHtml}</div>
  <div class="footer">Generated by your habit tracker · ${now}</div>
</body></html>`;
}

function ExportButton({
  stats,
  period,
  allHabits,
  allTaskDays,
  goals,
  scoreLabel,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  function downloadHtml() {
    const html = buildReportHtml(
      stats,
      period,
      allHabits,
      allTaskDays,
      goals,
      scoreLabel,
    );
    const blob = new Blob([html], { type: "text/html" }),
      url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateKey(new Date())}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  }
  function downloadPdf() {
    const html = buildReportHtml(
      stats,
      period,
      allHabits,
      allTaskDays,
      goals,
      scoreLabel,
    );
    const w = window.open("", "_blank", "width=960,height=700");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.onload = () => {
      w.focus();
      w.print();
    };
    setOpen(false);
  }
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="export-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
        style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#d1d5db",
        }}
      >
        <Download className="h-3.5 w-3.5" />
        Export
      </button>
      {open && (
        <div
          className="export-dropdown absolute right-0 top-full mt-1.5 z-50 rounded-xl shadow-2xl overflow-hidden w-44"
          style={{
            background: "#0d0f1a",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="px-3 pt-2.5 pb-1 text-[9px] text-gray-600 font-medium uppercase tracking-wider">
            Download report
          </div>
          <button
            onClick={downloadHtml}
            className="w-full text-left px-3 py-2.5 text-xs text-gray-300 flex items-center gap-2 transition-colors"
            style={{}}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "")}
          >
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded text-blue-400"
              style={{ background: "rgba(79,172,254,0.12)" }}
            >
              .html
            </span>
            HTML report
          </button>
          <button
            onClick={downloadPdf}
            className="w-full text-left px-3 py-2.5 text-xs text-gray-300 flex items-center gap-2 mb-1 transition-colors"
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "")}
          >
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded text-red-400"
              style={{ background: "rgba(239,68,68,0.12)" }}
            >
              .pdf
            </span>
            PDF (via print)
          </button>
        </div>
      )}
    </div>
  );
}

function computeTrend(days, accessor) {
  if (days.length < 4) return 0;
  const mid = Math.floor(days.length / 2);
  const first = days
    .slice(0, mid)
    .map(accessor)
    .filter((v) => v !== null);
  const last = days
    .slice(mid)
    .map(accessor)
    .filter((v) => v !== null);
  if (!first.length || !last.length) return 0;
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  return avg(last) - avg(first);
}
function computeStreak(sortedDays, hData) {
  let streak = 0;
  for (let i = sortedDays.length - 1; i >= 0; i--) {
    const h = hData[sortedDays[i]];
    if (!h || h.total === 0) break;
    if (h.done > 0) streak++;
    else break;
  }
  return streak;
}
function computeLongestStreak(sortedDays, hData) {
  let longest = 0,
    cur = 0;
  for (const d of sortedDays) {
    const h = hData[d];
    if (!h || h.total === 0) { cur = 0; continue; }
    if (h.done > 0) {
      cur++;
      longest = Math.max(longest, cur);
    } else cur = 0;
  }
  return longest;
}

function AnalyticsPanel() {
  const { user } = useAuthStore();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("28d");
  const [allHabits, setAllHabits] = useState({});
  const [allTaskDays, setAllTaskDays] = useState({});
  const [goals, setGoals] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const uid = user.uid,
        today = new Date(),
        monthIds = [];
      for (let i = 0; i < 13; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const id = getMonthId(d);
        if (!monthIds.includes(id)) monthIds.push(id);
      }
      monthIds.sort();
      const habitSnaps = await Promise.all(
        monthIds.map((m) =>
          getDocs(query(collection(db, "users", uid, "habits", m, "items"))),
        ),
      );
      const allHabitsFlat = {};
      habitSnaps.forEach((snap) =>
        snap.forEach((docSnap) => {
          const d = docSnap.data(),
            daysMap = d.days ?? d.dates ?? {},
            createdAt = d.createdAt;
          Object.entries(daysMap).forEach(([date, done]) => {
            if (createdAt && date < createdAt) return;
            if (!allHabitsFlat[date])
              allHabitsFlat[date] = { total: 0, done: 0 };
            allHabitsFlat[date].total++;
            if (done) allHabitsFlat[date].done++;
          });
        }),
      );
      setAllHabits(allHabitsFlat);
      const taskQuery = query(
        collection(db, "users", uid, "taskdays"),
        where(documentId(), ">=", dateKey(new Date(today.getFullYear(), today.getMonth() - 12, 1))),
        where(documentId(), "<=", dateKey(today)),
      );
      const taskSnap = await getDocs(taskQuery);
      const tasksMap = {};
      taskSnap.forEach((ds) => {
        tasksMap[ds.id] = ds.data().tasks ?? [];
      });
      setAllTaskDays(tasksMap);
      const goalsSnap = await getDocs(collection(db, "users", uid, "goals"));
      setGoals(goalsSnap.docs.map((d) => ({ ...d.data(), id: d.id })));
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rangeDays = period === "7d" ? 7 : period === "28d" ? 28 : 365;
    const cutDate = new Date(today);
    cutDate.setDate(cutDate.getDate() - rangeDays);
    const allDays = [
      ...new Set([...Object.keys(allHabits), ...Object.keys(allTaskDays)]),
    ].sort();
    const days = [],
      habits = {},
      tasks = {};
    allDays.forEach((d) => {
      const dt = new Date(d + "T00:00:00");
      if (dt >= cutDate && dt <= today) {
        days.push(d);
        if (allHabits[d]) habits[d] = allHabits[d];
        if (allTaskDays[d]) tasks[d] = allTaskDays[d];
      }
    });
    return { habits, tasks, days };
  }, [allHabits, allTaskDays, period]);

  const stats = useMemo(() => {
    const { habits: hData, tasks: tData, days } = filtered;
    const sortedDays = [...days].sort();
    const totalHabits = sortedDays.reduce(
      (s, d) => s + (hData[d]?.total ?? 0),
      0,
    );
    const doneHabits = sortedDays.reduce(
      (s, d) => s + (hData[d]?.done ?? 0),
      0,
    );
    const consistency = totalHabits > 0 ? (doneHabits / totalHabits) * 100 : 0;
    const activeDays = sortedDays.filter((d) => hData[d]?.total > 0).length;
    const perfectDays = sortedDays.filter((d) => {
      const h = hData[d];
      return h && h.total > 0 && h.done === h.total;
    }).length;
    const perfection = activeDays > 0 ? (perfectDays / activeDays) * 100 : 0;
    const streak = computeStreak(sortedDays, hData);
    const longestStreak = computeLongestStreak(sortedDays, hData);
    let imprSum = 0,
      imprCount = 0;
    const activeSorted = sortedDays.filter((d) => hData[d]?.total > 0);
    for (let i = 1; i < activeSorted.length; i++) {
      const p = hData[activeSorted[i - 1]],
        c = hData[activeSorted[i]];
      imprSum += Math.max(0, c.done / c.total - p.done / p.total);
      imprCount++;
    }
    const improvement = imprCount > 0 ? (imprSum / imprCount) * 100 : 0;
    const streakPct = Math.min(streak / Math.max(activeDays, 1), 1) * 100;
    const rawScore =
      consistency * 0.4 +
      streakPct * 0.25 +
      perfection * 0.2 +
      improvement * 0.15;
    const healthScore = Math.round(Math.max(0, Math.min(100, rawScore)));
    const allTaskArr = Object.values(tData).filter(Array.isArray);
    const totalTasks = allTaskArr.reduce((s, tasks) => s + tasks.length, 0);
    const tasksCompleted = allTaskArr.reduce(
      (s, tasks) => s + tasks.filter((t) => t.done).length,
      0,
    );
    const taskCompletionRate =
      totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

    const taskDayKeys = [...Object.keys(tData)].sort();
    let taskStreak = 0;
    for (const d of [...taskDayKeys].reverse()) {
      if (Array.isArray(tData[d]) && tData[d].some((t) => t.done)) taskStreak++;
      else break;
    }
    let longestTaskStreak = 0, curTaskStreak = 0;
    for (const d of taskDayKeys) {
      if (Array.isArray(tData[d]) && tData[d].some((t) => t.done)) {
        curTaskStreak++;
        longestTaskStreak = Math.max(longestTaskStreak, curTaskStreak);
      } else curTaskStreak = 0;
    }

    const totalGoals = goals.length;
    const goalsCompleted = goals.filter((g) => {
      const ms = Array.isArray(g.milestones) ? g.milestones : [];
      return ms.length > 0 && ms.every((m) => m.completed);
    }).length;
    const goalsInProgress = goals.filter((g) => {
      const ms = Array.isArray(g.milestones) ? g.milestones : [];
      return ms.length > 0 && ms.some((m) => m.completed) && !ms.every((m) => m.completed);
    }).length;
    const goalsProgress = goals.reduce(
      (s, g) =>
        s +
        (Array.isArray(g.milestones)
          ? g.milestones.filter((m) => m.completed).length
          : 0),
      0,
    );
    const goalsTotal = goals.reduce(
      (s, g) => s + (Array.isArray(g.milestones) ? g.milestones.length : 0),
      0,
    );
    const consistencyTrend = computeTrend(sortedDays, (d) => {
      const h = hData[d];
      return h && h.total > 0 ? (h.done / h.total) * 100 : null;
    });
    const perfectionTrend = computeTrend(sortedDays, (d) => {
      const h = hData[d];
      if (!h || h.total === 0) return null;
      return h.done === h.total ? 100 : 0;
    });
    return {
      consistency: Math.round(consistency),
      perfection: Math.round(perfection),
      improvement: Math.round(improvement),
      streak,
      longestStreak,
      streakPct: Math.round(streakPct),
      healthScore,
      daysTracked: days.length,
      activeDays,
      hasHabitData: totalHabits > 0,
      totalTasks,
      tasksCompleted,
      taskCompletionRate,
      taskStreak,
      longestTaskStreak,
      totalGoals,
      goalsCompleted,
      goalsInProgress,
      milestonesProgress:
        goalsTotal > 0 ? Math.round((goalsProgress / goalsTotal) * 100) : 0,
      consistencyTrend: Math.round(consistencyTrend),
      perfectionTrend: Math.round(perfectionTrend),
    };
  }, [filtered, goals]);

  const scoreLabel = useMemo(
    () => (stats ? getScoreLabel(stats.healthScore) : null),
    [stats],
  );

  const showFullAnalytics = stats ? stats.activeDays >= 3 : false;

  if (loading)
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            {[...Array(3)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-7 w-16 rounded-lg" />
            ))}
          </div>
          <LoadingSkeleton className="h-7 w-20 rounded-lg ml-auto" />
        </div>

        <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-4 pb-5 border-b border-white/5">
              <LoadingSkeleton className="h-20 w-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <LoadingSkeleton className="h-6 w-32" />
                <LoadingSkeleton className="h-3 w-48" />
                <LoadingSkeleton className="h-1 w-full rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-5">
              <LoadingSkeleton className="h-10 w-20" />
              <div className="w-px self-stretch bg-white/5" />
              <LoadingSkeleton className="h-10 w-16" />
              <div className="w-px self-stretch bg-white/5" />
              <LoadingSkeleton className="h-10 w-16" />
              <div className="w-px self-stretch bg-white/5" />
              <LoadingSkeleton className="h-10 w-16" />
            </div>
          </div>
        </div>

        <LoadingSkeleton className="h-48 w-full rounded-xl" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-surface-700/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                <LoadingSkeleton className="h-9 w-9 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <LoadingSkeleton className="h-3 w-16" />
                  <LoadingSkeleton className="h-5 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <LoadingSkeleton className="h-56 w-full rounded-xl" />

        <div className="space-y-3">
          <LoadingSkeleton className="h-4 w-28" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-white/[0.04] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LoadingSkeleton className="h-7 w-7 rounded-lg" />
                    <div>
                      <LoadingSkeleton className="h-3 w-16" />
                      <LoadingSkeleton className="h-3 w-12 mt-0.5" />
                    </div>
                  </div>
                  <LoadingSkeleton className="h-5 w-12" />
                </div>
                <LoadingSkeleton className="h-1.5 w-full rounded-full" />
                <LoadingSkeleton className="h-3 w-40" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-surface-700/30 rounded-xl p-5 space-y-2">
              <LoadingSkeleton className="h-4 w-16" />
              <LoadingSkeleton className="h-8 w-12" />
              <LoadingSkeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    );

  const hasAnyData =
    stats &&
    (stats.hasHabitData || stats.tasksCompleted > 0 || stats.totalGoals > 0);
  const hasTaskOrGoalData = stats && (stats.totalTasks > 0 || stats.totalGoals > 0);

  const scoreColors = {
    green: "#22c55e",
    blue: "#4facfe",
    yellow: "#eab308",
    orange: "#f97316",
    red: "#ef4444",
  };
  const accentColor = scoreColors[scoreLabel?.color] ?? "#4facfe";

  return (
    <div className="space-y-5">
      {hasAnyData ? (
        <>
          <div className="flex items-center gap-1.5">
            <div
              className="flex items-center gap-1 p-1 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {[
                { id: "7d", label: "7 Days" },
                { id: "28d", label: "Monthly" },
                { id: "all", label: "All Time" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={
                    period === p.id
                      ? {
                          background: "rgba(79,172,254,0.15)",
                          color: "#7dd3fc",
                          border: "1px solid rgba(79,172,254,0.25)",
                        }
                      : { color: "#6b7280", border: "1px solid transparent" }
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2.5">
              <span className="text-[10px] text-gray-600 hidden sm:inline">
                {stats?.activeDays ?? 0} active days
              </span>
              <ExportButton
                stats={stats}
                period={period}
                allHabits={allHabits}
                allTaskDays={allTaskDays}
                goals={goals}
                scoreLabel={scoreLabel}
              />
            </div>
          </div>

          {showFullAnalytics ? (
          <>

          <div
            className="rounded-2xl overflow-hidden analytics-hero"
            style={{
              background:
                "linear-gradient(135deg, rgba(13,17,23,0.9) 0%, rgba(13,17,23,0.95) 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              className="h-px w-full"
              style={{
                background: `linear-gradient(90deg,transparent,${accentColor}66,transparent)`,
              }}
            />

            <div className="p-5 sm:p-6">
              <div
                className="flex items-center gap-4 mb-5 pb-5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <ScoreRing score={stats.healthScore} size={80} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-white">
                      {stats.healthScore}
                    </span>
                    <span className="text-sm text-gray-500">/100</span>
                    {scoreLabel && (
                      <span
                        className="ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: `${accentColor}18`,
                          color: accentColor,
                          border: `1px solid ${accentColor}33`,
                        }}
                      >
                        {scoreLabel.label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{scoreLabel?.desc}</p>
                  <div
                    className="hero-progress mt-2.5 h-1 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${stats.healthScore}%`,
                        background: `linear-gradient(90deg,${accentColor}88,${accentColor})`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0">
                <div className="flex items-center gap-3 pr-5">
                  <FireIcon size={36} />
                  <div>
                    <div className="text-2xl font-bold text-white leading-none">
                      {stats.streak}
                      <span className="text-base text-gray-500 font-normal">
                        d
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      current streak
                    </div>
                  </div>
                </div>

                <div
                  className="w-px self-stretch mx-0"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />

                <div className="flex flex-col items-center justify-center px-5">
                  <div className="text-lg font-bold text-white leading-none">
                    {stats.longestStreak}
                    <span className="text-sm text-gray-500 font-normal">d</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    longest
                  </div>
                </div>

                <div
                  className="w-px self-stretch"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />

                <div className="flex flex-col items-center justify-center px-5">
                  <div className="text-lg font-bold text-white leading-none">
                    {stats.activeDays}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    active days
                  </div>
                </div>

                <div
                  className="w-px self-stretch hidden sm:block"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />

                <div className="flex-col items-center justify-center px-5 hidden sm:flex">
                  <div
                    className="text-lg font-bold leading-none"
                    style={{ color: "#4facfe" }}
                  >
                    {stats.consistency}%
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    consistency
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xs">
                <Calendar className="h-3.5 w-3.5 text-primary-400" />
                Daily Tracking
                <span className="text-gray-600 font-normal">— last year</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 overflow-hidden">
              <GithubCalendar data={allHabits} taskData={allTaskDays} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                icon: Activity,
                color: "text-blue-400",
                bg: "bg-blue-500/10",
                label: "Consistency",
                value: `${stats.consistency}%`,
                sub: `${stats.daysTracked} days`,
              },
              {
                icon: Flame,
                color: "text-orange-400",
                bg: "bg-orange-500/10",
                label: "Streak",
                value: `${stats.streak}d`,
                sub: `best: ${stats.longestStreak}d`,
              },
              {
                icon: Target,
                color: "text-green-400",
                bg: "bg-green-500/10",
                label: "Perfection",
                value: `${stats.perfection}%`,
                sub: "perfect days",
              },
              {
                icon: TrendingUp,
                color: "text-purple-400",
                bg: "bg-purple-500/10",
                label: "Improvement",
                value: `${stats.improvement}%`,
                sub: "day over day",
              },
            ].map((item) => (
              <Card key={item.label} className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}
                  >
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 truncate">
                      {item.label}
                    </p>
                    <p className="text-base font-bold text-white truncate leading-tight">
                      {item.value}
                    </p>
                    <p className="text-[10px] text-gray-600 truncate">
                      {item.sub}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {stats.hasHabitData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xs">
                  <BarChart3 className="h-3.5 w-3.5 text-primary-400" />
                  Habit trend
                  <span className="text-gray-600 font-normal">
                    —{" "}
                    {period === "7d"
                      ? "7 days"
                      : period === "28d"
                        ? "28 days"
                        : "all time"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-4">
                <LineChart
                  habitData={filtered.habits}
                  taskData={filtered.tasks}
                  days={filtered.days}
                />
              </CardContent>
            </Card>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-400">
                Score Breakdown
              </p>
              <span className="text-sm font-bold text-white">
                {stats.healthScore}
                <span className="text-xs text-gray-500">/100</span>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ScoreBreakdownCard
                label="Consistency"
                weight="40% weight"
                value={stats.consistency}
                trend={stats.consistencyTrend}
                color="bg-blue-500"
                bgColor="bg-blue-500/10"
                icon={Activity}
                iconColor="text-blue-400"
                description="Fraction of all tracked habits you completed"
              />
              <ScoreBreakdownCard
                label="Streak"
                weight="25% weight"
                value={stats.streakPct}
                trend={stats.streak > 1 ? 5 : -5}
                color="bg-orange-500"
                bgColor="bg-orange-500/10"
                icon={Flame}
                iconColor="text-orange-400"
                description={`Current ${stats.streak}d streak vs ${stats.activeDays} active days`}
              />
              <ScoreBreakdownCard
                label="Perfection"
                weight="20% weight"
                value={stats.perfection}
                trend={stats.perfectionTrend}
                color="bg-green-500"
                bgColor="bg-green-500/10"
                icon={Target}
                iconColor="text-green-400"
                description="Days where every single habit was completed"
              />
              <ScoreBreakdownCard
                label="Improvement"
                weight="15% weight"
                value={Math.min(100, stats.improvement)}
                trend={stats.improvement > 5 ? 3 : 0}
                color="bg-purple-500"
                bgColor="bg-purple-500/10"
                icon={TrendingUp}
                iconColor="text-purple-400"
                description="Average day-over-day completion rate gain"
              />
            </div>
          </div>
          </>
          ) : (
            <div className="rounded-2xl border border-surface-700/30 p-6 sm:p-8 text-center space-y-6">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-500/15 border border-primary-500/20 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Keep Tracking for 3 Days — Here's What's Coming</h3>
                  <p className="text-sm text-gray-400 mt-1">Complete your daily habits to unlock health scores, streaks, and trends.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => setLightboxImage('/analytics1.png')}
                  className="group relative overflow-hidden rounded-xl border border-surface-700/30 bg-surface-900/50 flex-1 max-w-md transition-all duration-300 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 text-left cursor-pointer">
                  <img src="/analytics1.png" alt="Analytics preview"
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface-900/80 to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>
                  </div>
                </button>
                <button onClick={() => setLightboxImage('/analytics2.png')}
                  className="group relative overflow-hidden rounded-xl border border-surface-700/30 bg-surface-900/50 flex-1 max-w-md transition-all duration-300 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 text-left cursor-pointer">
                  <img src="/analytics2.png" alt="Analytics preview"
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface-900/80 to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>
                  </div>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xs">
                  <Award className="h-3.5 w-3.5 text-yellow-400" /> Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">
                  {stats.goalsCompleted}
                </p>
                <p className="text-xs text-gray-500">
                  of {stats.totalGoals} goals
                  {stats.goalsInProgress > 0 && (
                    <span className="text-gray-600 ml-1">&middot; {stats.goalsInProgress} in progress</span>
                  )}
                </p>
                <div className="mt-2 h-1 bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500/70 rounded-full transition-all duration-700"
                    style={{ width: `${stats.milestonesProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-600 mt-1">
                  Milestones: {stats.milestonesProgress}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xs">
                  <Activity className="h-3.5 w-3.5 text-blue-400" /> Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">
                  {stats.tasksCompleted}
                </p>
                <p className="text-xs text-gray-500">
                  of {stats.totalTasks} tasks
                  {stats.taskCompletionRate > 0 && (
                    <span className="text-gray-600 ml-1">&middot; {stats.taskCompletionRate}% rate</span>
                  )}
                </p>
                {stats.taskCompletionRate > 0 && (
                  <div className="mt-2 h-1 bg-surface-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500/70 rounded-full transition-all duration-700"
                      style={{ width: `${stats.taskCompletionRate}%` }} />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xs">
                  <Flame className="h-3.5 w-3.5 text-orange-400" /> Task Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">
                  {stats.taskStreak}d
                </p>
                <p className="text-xs text-gray-500">current streak</p>
                {stats.longestTaskStreak > 0 && (
                  <p className="text-[10px] text-gray-600 mt-1">Longest: {stats.longestTaskStreak}d</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center py-16 max-w-md mx-auto">
          <BarChart3 className="h-16 w-16 text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            No analytics yet
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Start tracking your habits, tasks, and goals to see stats, streaks,
            and progress over time.
          </p>
          <div className="grid grid-cols-3 gap-4 text-left">
            {[
              { n: "1", t: "Add habits", d: "Start your daily routine" },
              { n: "2", t: "Track daily", d: "Check off each day" },
              { n: "3", t: "Watch grow", d: "See your streaks build" },
            ].map((s) => (
              <div
                key={s.n}
                className="bg-surface-800 rounded-xl p-4 border border-surface-700/30"
              >
                <p className="text-xs text-gray-400 font-medium mb-1">{s.n}</p>
                <p className="text-sm text-gray-300">{s.t}</p>
                <p className="text-[10px] text-gray-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setLightboxImage(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <img src={lightboxImage} alt="Analytics preview"
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl" />
            <button onClick={() => setLightboxImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-surface-800 border border-surface-600 flex items-center justify-center text-gray-400 hover:text-white hover:bg-surface-700 transition-all shadow-lg">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsPanel;
