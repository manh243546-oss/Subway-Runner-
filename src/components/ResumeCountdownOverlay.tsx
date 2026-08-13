import React from 'react';
import { Pause, Clock, Zap } from 'lucide-react';

interface ResumeCountdownOverlayProps {
  countdown: number;
}

export const ResumeCountdownOverlay: React.FC<ResumeCountdownOverlayProps> = ({ countdown }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none pointer-events-auto animate-in fade-in duration-150">
      <div className="relative flex flex-col items-center text-center space-y-6 max-w-sm w-full bg-slate-900/95 border border-slate-700/80 p-8 rounded-3xl shadow-2xl">
        {/* Glowing Ambient Backdrop Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-amber-500 to-orange-500 rounded-3xl blur-xl opacity-20 animate-pulse" />

        {/* Top Header Badge */}
        <div className="relative flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-4 py-1.5 rounded-full text-xs font-black text-amber-300 shadow-md">
          <Pause className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          <span className="tracking-wide uppercase">TẠM DỪNG • TỰ ĐỘNG TIẾP TỤC</span>
        </div>

        {/* Huge Central Countdown Display */}
        <div className="relative flex flex-col items-center justify-center my-2">
          {/* Animated Ring */}
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-amber-400/30 flex items-center justify-center relative shadow-inner">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin duration-1000" />
            
            <div
              key={countdown}
              className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)] animate-in zoom-in-50 duration-200"
            >
              {countdown > 0 ? countdown : 'GO!'}
            </div>
          </div>
        </div>

        {/* Time Detail Text */}
        <div className="relative space-y-1">
          <div className="flex items-center justify-center gap-2 text-slate-300 text-sm font-bold">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Thời gian đếm ngược: <strong className="text-cyan-300 font-mono text-base">00:0{Math.max(0, countdown)}s</strong></span>
          </div>
          <p className="text-xs font-semibold text-slate-400">
            {countdown > 0
              ? `Nhân vật đang đứng yên. Trò chơi tiếp tục sau ${countdown} giây...`
              : 'Sẵn sàng chạy tiếp!'}
          </p>
        </div>

        {/* Dynamic Status Notification */}
        <div className="relative flex items-center gap-2 text-xs font-black text-slate-300 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>GIỮ NGUYÊN VỊ TRÍ & SẴN SÀNG ĐIỀU KHIỂN</span>
        </div>
      </div>
    </div>
  );
};
