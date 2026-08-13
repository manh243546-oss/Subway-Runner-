import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { PlayerStats, DailyTaskState } from '../types';
import { DailyChallengeManager } from '../game/DailyChallengeManager';
import { Calendar, Gift, Check, Coins, Shield, X, AlertCircle, Sparkles } from 'lucide-react';

interface DailyChallengeModalProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onClose: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({ stats, onUpdateStats, onClose }) => {
  const { updatedStats } = DailyChallengeManager.ensureDailyChallenge(stats);
  const currentStats = updatedStats;
  const dcState = currentStats.dailyChallenge!;
  const tasks: DailyTaskState[] = dcState.tasks || [];

  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleClaimTask = (taskId: string) => {
    const res = DailyChallengeManager.claimTaskReward(currentStats, taskId);
    if (res.success && res.updatedStats) {
      onUpdateStats(res.updatedStats);
      setToastMsg({ type: 'success', text: res.message });
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignored if confetti unavailable
      }
    } else {
      setToastMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md sm:max-w-lg p-4 sm:p-6 shadow-2xl text-slate-100 relative flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-2xl text-slate-950 shadow-lg shadow-orange-500/20">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-amber-400 tracking-tight uppercase drop-shadow-sm flex items-center gap-2">
                <span>THỬ THÁCH HẰNG NGÀY</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-bold">
                Hoàn thành 3 nhiệm vụ để nhận phần thưởng hấp dẫn!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-95 cursor-pointer shrink-0"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification Message */}
        {toastMsg && (
          <div
            className={`p-2.5 rounded-xl text-xs font-bold mb-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 shrink-0 ${
              toastMsg.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{toastMsg.text}</span>
          </div>
        )}

        {/* 3 Task Cards Container */}
        <div className="overflow-y-auto space-y-3 pr-0.5 custom-scrollbar flex-1">
          {tasks.map((task, index) => {
            const isCompleted = task.currentProgress >= task.targetValue;
            const isClaimed = task.claimed;
            const progressPct = Math.min(100, Math.round((task.currentProgress / task.targetValue) * 100));

            return (
              <div
                key={task.id}
                className={`relative rounded-2xl p-3.5 sm:p-4 transition-all duration-200 border ${
                  isClaimed
                    ? 'bg-slate-950/50 border-slate-800 opacity-80'
                    : isCompleted
                    ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-amber-400/80 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Task Header & Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl sm:text-3xl p-1.5 sm:p-2 bg-slate-800/80 rounded-xl border border-slate-700/60 shrink-0">
                      {task.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                          NHIỆM VỤ {index + 1}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white mt-0.5 truncate">
                        {task.title}
                      </h3>
                    </div>
                  </div>

                  {/* Status Tag */}
                  <div className="shrink-0">
                    {isClaimed ? (
                      <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> ĐÃ NHẬN
                      </span>
                    ) : isCompleted ? (
                      <span className="bg-amber-500 text-slate-950 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse shadow-md">
                        <Sparkles className="w-3.5 h-3.5 fill-slate-950" /> XONG
                      </span>
                    ) : (
                      <span className="bg-slate-800/90 text-slate-400 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border border-slate-700/50">
                        ĐANG TIẾN HÀNH
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium mb-3">
                  {task.description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Tiến độ:</span>
                    <span className={`font-mono text-xs sm:text-sm ${isCompleted ? 'text-emerald-400' : 'text-amber-300'}`}>
                      {isCompleted ? '✓ ' : ''}{task.currentProgress.toLocaleString()} / {task.targetValue.toLocaleString()} ({progressPct}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 shadow-md ${
                        isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300'
                          : 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Reward & Action Button */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="bg-amber-500/20 border border-amber-400/40 text-amber-300 px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 fill-amber-400" />
                      <span>+{task.rewardCoins} Xu</span>
                    </div>

                    {task.rewardHoverboards && task.rewardHoverboards > 0 ? (
                      <div className="bg-blue-500/20 border border-blue-400/40 text-blue-300 px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" />
                        <span>+{task.rewardHoverboards} Ván</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Button "NHẬN THƯỞNG" */}
                  <div>
                    {isClaimed ? (
                      <button
                        disabled
                        className="px-3 py-1.5 bg-slate-800/80 text-emerald-400/80 font-bold text-xs rounded-xl cursor-not-allowed border border-emerald-500/20 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã nhận</span>
                      </button>
                    ) : isCompleted ? (
                      <button
                        onClick={() => handleClaimTask(task.id)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center gap-1.5 border border-amber-300/80 cursor-pointer animate-bounce"
                      >
                        <Gift className="w-4 h-4 fill-slate-950" />
                        <span>NHẬN THƯỞNG</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-3 py-1.5 bg-slate-800/60 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed border border-slate-700/50"
                      >
                        Đang tiến hành...
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
