import React from 'react';
import { PlayerStats } from '../types';
import { DailyChallengeManager } from '../game/DailyChallengeManager';
import { Gift, Check, ArrowRight, Calendar } from 'lucide-react';

interface DailyChallengeWidgetProps {
  stats: PlayerStats;
  onOpenModal: () => void;
  onUpdateStats: (newStats: PlayerStats) => void;
}

export const DailyChallengeWidget: React.FC<DailyChallengeWidgetProps> = ({
  stats,
  onOpenModal,
  onUpdateStats,
}) => {
  const { updatedStats } = DailyChallengeManager.ensureDailyChallenge(stats);
  const dcState = updatedStats.dailyChallenge!;
  const tasks = dcState.tasks || [];

  const claimableTask = tasks.find((t) => t.currentProgress >= t.targetValue && !t.claimed);
  const hasUnclaimed = !!claimableTask;
  const allClaimed = tasks.length > 0 && tasks.every((t) => t.claimed);

  const totalUnclaimedCoins = tasks
    .filter((t) => t.currentProgress >= t.targetValue && !t.claimed)
    .reduce((sum, t) => sum + t.rewardCoins, 0);

  const handleClaim = (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = DailyChallengeManager.claimReward(updatedStats);
    if (res.success && res.updatedStats) {
      onUpdateStats(res.updatedStats);
    }
  };

  return (
    <button
      onClick={onOpenModal}
      className={`group cursor-pointer relative rounded-lg sm:rounded-xl px-2 sm:px-2.5 py-0.5 border backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm flex items-center gap-1 whitespace-nowrap select-none min-h-0 ${
        hasUnclaimed
          ? 'bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-amber-500/30 border-amber-400 text-amber-300 shadow-amber-500/20 animate-pulse'
          : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/50 text-amber-300'
      }`}
      title="Thử thách hằng ngày"
    >
      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400 shrink-0" />
      <span className="text-[9px] sm:text-xs font-black tracking-wider uppercase">Thử Thách Hằng Ngày</span>

      {hasUnclaimed ? (
        <span
          onClick={handleClaim}
          className="px-1 py-0 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[9px] sm:text-[10px] rounded shadow transition-all active:scale-95 flex items-center gap-0.5 shrink-0 ml-0.5 border border-amber-300/80 cursor-pointer"
          title="Nhận thưởng ngay"
        >
          <Gift className="w-2.5 h-2.5 fill-slate-950" />
          <span>+{totalUnclaimedCoins}</span>
        </span>
      ) : allClaimed ? (
        <span className="text-[9px] sm:text-xs font-bold text-emerald-400 flex items-center gap-0.5 ml-0.5" title="Đã hoàn thành">
          <Check className="w-3 h-3 text-emerald-400" />
          <span className="text-[8px] sm:text-[10px]">Đã nhận</span>
        </span>
      ) : (
        <ArrowRight className="w-3 h-3 text-amber-400/80 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-transform shrink-0 ml-0.5" />
      )}
    </button>
  );
};
