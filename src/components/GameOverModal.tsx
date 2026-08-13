import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PlayerStats } from '../types';
import { DailyChallengeManager } from '../game/DailyChallengeManager';
import { RotateCcw, Trophy, Coins, Check, Home, Clock, Footprints, Calendar } from 'lucide-react';
import { formatTime } from '../utils/formatters';

interface GameOverModalProps {
  score: number;
  highScore: number;
  coins: number;
  distance?: number;
  runTime?: number;
  longestTime?: number;
  isNewRecord: boolean;
  isNewTimeRecord?: boolean;
  stats?: PlayerStats;
  onRestart: () => void;
  onReturnToMenu?: () => void;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onOpenDailyChallenge?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  coins,
  distance = 0,
  runTime = 0,
  longestTime = 0,
  isNewRecord,
  isNewTimeRecord = false,
  stats,
  onRestart,
  onReturnToMenu,
  onOpenShop,
  onOpenLeaderboard,
  onOpenDailyChallenge,
}) => {
  useEffect(() => {
    if (isNewRecord || isNewTimeRecord) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignored if confetti fails
      }
    }
  }, [isNewRecord, isNewTimeRecord]);

  // Compute Daily Challenge details if stats passed
  let dcWidget = null;
  if (stats) {
    const { updatedStats } = DailyChallengeManager.ensureDailyChallenge(stats);
    const dcState = updatedStats.dailyChallenge!;
    const tasks = dcState.tasks || [];
    const completedCount = tasks.filter((t) => t.currentProgress >= t.targetValue).length;
    const hasUnclaimed = tasks.some((t) => t.currentProgress >= t.targetValue && !t.claimed);
    const allClaimed = tasks.length > 0 && tasks.every((t) => t.claimed);

    dcWidget = (
      <div
        onClick={onOpenDailyChallenge}
        className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left cursor-pointer transition-all shadow-sm ${
          hasUnclaimed
            ? 'bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 border-amber-400 hover:border-amber-300'
            : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-amber-400">
            <Calendar className="w-4 h-4 text-orange-400" />
            <span>THỬ THÁCH HẰNG NGÀY</span>
          </div>

          {allClaimed ? (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Tất cả đã nhận
            </span>
          ) : hasUnclaimed ? (
            <span className="text-xs bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full animate-bounce">
              NHẬN THƯỞNG!
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-mono font-bold">
              Hoàn thành: {completedCount}/3
            </span>
          )}
        </div>

        <div className="text-[11px] text-slate-300 font-medium flex justify-between items-center">
          <span>Nhấp để xem & nhận thưởng 3 nhiệm vụ</span>
          <span className="text-amber-400 font-bold">Chi tiết →</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-3xl w-full max-w-lg sm:max-w-xl p-4 sm:p-5 text-slate-100 flex flex-col items-center text-center space-y-3 sm:space-y-3.5 max-h-[95vh] overflow-y-auto custom-scrollbar">
        {/* Crash Header */}
        <div className="space-y-0.5">
          <div className="inline-block bg-rose-500/20 text-rose-300 font-black text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full">
            💥 VỤ VA CHẠM ĐƯỜNG MẠNG
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
            KẾT THÚC LƯỢT CHẠY!
          </h2>
        </div>

        {/* Score / Distance Display Card */}
        <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 sm:p-3.5 space-y-2.5 shadow-inner">
          {isNewRecord && (
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-slate-950 font-black text-xs py-1 rounded-xl flex items-center justify-center gap-1.5 animate-bounce shadow-md">
              <Footprints className="w-4 h-4" /> LẬP KỶ LỤC QUÃNG ĐƯỜNG MỚI!
            </div>
          )}

          {isNewTimeRecord && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs py-1 rounded-xl flex items-center justify-center gap-1.5 animate-bounce shadow-md">
              <Clock className="w-4 h-4" /> KỶ LỤC THỜI GIAN CHẠY MỚI!
            </div>
          )}

          <div>
            <div className="text-[10px] sm:text-[11px] uppercase font-bold tracking-widest text-slate-400">
              QUÃNG ĐƯỜNG ĐẠT ĐƯỢC
            </div>
            <div className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono tracking-tight mt-0.5 drop-shadow">
              {distance.toLocaleString()}m
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 border-t border-slate-800/80 pt-2.5">
            <div className="flex flex-col items-center sm:items-start gap-0.5 p-1.5 sm:p-2 bg-slate-900/80 rounded-xl border border-slate-800/80">
              <span className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" /> Xu Nhặt
              </span>
              <span className="font-bold text-amber-300 font-mono text-xs sm:text-sm">
                +{coins.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col items-center sm:items-start gap-0.5 p-1.5 sm:p-2 bg-slate-900/80 rounded-xl border border-slate-800/80">
              <span className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Thời Gian
              </span>
              <span className="font-bold text-emerald-300 font-mono text-xs sm:text-sm">
                {formatTime(runTime)}
              </span>
            </div>

            <div className="flex flex-col items-center sm:items-start gap-0.5 p-1.5 sm:p-2 bg-slate-900/80 rounded-xl border border-slate-800/80">
              <span className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Kỷ Lục Giờ
              </span>
              <span className="font-bold text-white font-mono text-xs sm:text-sm">
                {formatTime(longestTime)}
              </span>
            </div>
          </div>

          <div className="text-[11px] sm:text-xs text-slate-400 pt-2 border-t border-slate-800/60 flex items-center justify-between">
            <span>Kỷ lục quãng đường xa nhất:</span>
            <strong className="text-cyan-400 font-mono font-bold text-xs sm:text-sm">{highScore.toLocaleString()}m</strong>
          </div>
        </div>

        {/* Daily Challenge Progress Card */}
        {dcWidget}

        {/* Action Buttons */}
        <div className="w-full pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
            <button
              onClick={onRestart}
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm sm:text-base rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span>CHẠY LẠI NGAY</span>
            </button>

            {onReturnToMenu && (
              <button
                onClick={onReturnToMenu}
                className="w-full py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/60 font-black text-sm sm:text-base rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                <span>MENU CHÍNH</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
