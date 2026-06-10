import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, CheckCircle2, Circle, Target, AlarmCheck } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

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
  const [modalOpen, setModalOpen] = useState(false);
  const milestones = Array.isArray(goal.milestones) ? goal.milestones : [];
  const doneCount = milestones.filter(m => m.completed).length;
  const progress = milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : 0;
  const color = categoryColors[goal.category] || 'gray';
  const hex = hexColors[goal.category] || '#6b7280';

  return (
    <>
      <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden">
        <Card className="cursor-pointer hover:border-surface-600 transition-colors" onClick={() => setModalOpen(true)}>
          <CardContent>
            <div className="flex gap-4 min-w-0">
              {milestones.length > 0 && (
                <ProgressRing progress={progress} color={hex} />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1">
                      <Badge color={color} className="shrink-0 text-[10px]">{goal.category}</Badge>
                    </div>
                    <h3 className="text-sm font-medium text-white truncate leading-snug" title={goal.title}>{goal.title}</h3>
                    {goal.description && (
                      <p className="text-xs text-gray-400 truncate mt-0.5" title={goal.description}>{goal.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 self-start shrink-0">
                    <span className="text-[10px] text-gray-500">Q{goal.quarter} {goal.year}</span>
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
          </CardContent>
        </Card>
      </motion.div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={goal.title} className="w-[80vw] sm:w-[70vw] max-w-3xl max-h-[70vh]" scrollable>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={color} className="text-[10px]">{goal.category}</Badge>
            <span className="text-[10px] text-gray-500">Q{goal.quarter} {goal.year}</span>
            {goal.targetDate && (
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                Due {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>

          {goal.description && (
            <p className="text-xs text-gray-300 leading-relaxed">{goal.description}</p>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400">Progress</span>
              <span className="text-xs font-semibold" style={{ color: hex }}>{progress}%</span>
            </div>
            <div className="h-1.5 bg-surface-700/50 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-primary-500 to-blue-400'}`}
                style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" style={{ color: hex }} />
              Milestones ({doneCount}/{milestones.length})
            </h4>
            {milestones.length === 0 ? (
              <p className="text-xs text-gray-600">No milestones yet</p>
            ) : (
              <div className="space-y-1.5">
                {milestones.map((m, idx) => (
                  <div key={idx}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all ${
                      m.completed
                        ? 'border-green-500/20 bg-green-500/5'
                        : 'border-white/[0.06] bg-white/[0.02]'
                    }`}
                  >
                    <button onClick={(e) => { e.stopPropagation(); onToggleMilestone(goal.id, idx, m.completed); }} className="shrink-0">
                      {m.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-500 hover:text-gray-300 transition-colors" />
                      )}
                    </button>
                    <span className={`text-xs flex-1 ${m.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{m.text}</span>
                    {m.completed && (
                      <span className="text-[9px] text-green-400/70 font-medium">Done</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-white/[0.06]">
            <button onClick={() => { onDelete(goal.id); setModalOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
              Delete goal
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default GoalCard;
