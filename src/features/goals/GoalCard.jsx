import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const categoryColors = {
  health: 'green', career: 'blue', finance: 'yellow',
  education: 'purple', relationships: 'red', general: 'blue',
};

const hexColors = {
  health: '#22c55e', career: '#4facfe', finance: '#eab308',
  education: '#a855f7', relationships: '#ef4444', general: '#4facfe',
};

function ProgressRing({ progress, color, size = 68 }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dashOff = circ * (1 - Math.min(progress, 100) / 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dashOff}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color }}>{progress}%</span>
    </div>
  );
}

function GoalCard({ goal, onDelete, onToggleMilestone }) {
  const [expanded, setExpanded] = useState(false);
  const milestones = Array.isArray(goal.milestones) ? goal.milestones : [];
  const doneCount = milestones.filter(m => m.completed).length;
  const progress = milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : 0;
  const color = categoryColors[goal.category] || 'gray';
  const hex = hexColors[goal.category] || '#6b7280';

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="cursor-pointer hover:border-surface-600 transition-colors" onClick={() => setExpanded(!expanded)}>
        <CardContent className="p-5">
          <div className="flex gap-4">
            {milestones.length > 0 && (
              <ProgressRing progress={progress} color={hex} />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate max-w-[160px] sm:max-w-[260px]" title={goal.title}>{goal.title}</h3>
                    <Badge color={color} className="shrink-0">{goal.category}</Badge>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-gray-400 truncate max-w-[200px] sm:max-w-[300px]" title={goal.description}>{goal.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-500">Q{goal.quarter} {goal.year}</span>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(goal.id); }}
                    className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {milestones.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <div className="h-1 bg-surface-700/50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-primary-500 to-blue-400'}`}
                      style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>{doneCount}/{milestones.length} milestones</span>
                    {goal.targetDate && <span>Due {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </div>

          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              className="overflow-hidden">
              <div className="mt-4 space-y-2 border-t-[0.5px] border-surface-700/30 pt-4">
                {milestones.length === 0 ? (
                  <p className="text-sm text-gray-500">No milestones yet</p>
                ) : (
                  milestones.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-1.5">
                      <button onClick={(e) => { e.stopPropagation(); onToggleMilestone(goal.id, idx, m.completed); }} className="shrink-0">
                        {m.completed
                          ? <CheckCircle2 className="h-4 w-4" style={{ color: hex }} />
                          : <Circle className="h-4 w-4 text-gray-500 hover:text-gray-300 transition-colors" />
                        }
                      </button>
                      <span className={`text-sm ${m.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{m.text}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default GoalCard;
