import React from 'react';
import { PlayerStats } from '../types';
import { DailyChallengeWidget } from './DailyChallengeWidget';
import {
  Play,
  Trophy,
  Settings,
  Sparkles,
  Flame,
  Coins,
  Clock,
  Footprints,
} from 'lucide-react';
import { formatTime } from '../utils/formatters';

interface StartScreenProps {
  stats: PlayerStats;
  onPlay: () => void;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
  onOpenDailyChallenge: () => void;
  onUpdateStats: (newStats: PlayerStats) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  stats,
  onPlay,
  onOpenShop,
  onOpenLeaderboard,
  onOpenSettings,
  onOpenDailyChallenge,
  onUpdateStats,
}) => {
  return (
    <div className="absolute inset-0 z-20 h-dvh max-h-screen w-full bg-gradient-to-b from-slate-950/90 via-blue-950/70 to-slate-950/95 backdrop-blur-sm flex flex-col justify-start gap-1 p-2 sm:p-3 md:p-4 overflow-hidden select-none">
      {/* 1. Header Bar: Quick Nav Modals */}
      <header className="w-full max-w-7xl mx-auto flex flex-col gap-0.5 pb-0.5 border-b-0 shrink-0">
        {/* Dòng 1: Logo Brand + Quick Access Buttons */}
        <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Brand Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink">
            <div className="p-1 sm:p-1.5 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-xl sm:rounded-2xl shadow-lg border border-amber-300/40 shrink-0 transform -rotate-3 hover:rotate-0 transition-transform">
              <Flame className="w-4 h-4 sm:w-6 sm:h-6 text-slate-950 fill-slate-950" />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-xs font-black text-amber-400 uppercase tracking-wider sm:tracking-widest font-mono leading-none truncate">
                Subway Runner
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-300 font-medium hidden mt-1">
                Vật lý 3D • GPU Instanced Engine
              </div>
            </div>
          </div>

          {/* Quick Access Action Bar */}
          <div className="bg-slate-900/90 border border-slate-700/80 backdrop-blur-md p-0.5 rounded-xl sm:rounded-2xl flex items-center gap-1 sm:gap-1.5 shadow-xl shrink-0">
            <button
              onClick={onOpenShop}
              className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[8px] sm:text-xs font-black flex items-center gap-1 sm:gap-1.5 shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer min-h-[32px] sm:min-h-[36px]"
              title="Cửa hàng"
            >
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400 shrink-0" />
              <span>{stats.coins.toLocaleString()}</span>
            </button>

            <button
              onClick={onOpenLeaderboard}
              className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[8px] sm:text-xs font-black flex items-center gap-1 sm:gap-1.5 shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer min-h-[32px] sm:min-h-[36px]"
              title="Bảng xếp hạng"
            >
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
              <span className="hidden min-[360px]:inline">BXH</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600/60 text-slate-200 hover:text-white transition-all active:scale-95 cursor-pointer min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center"
              title="Cài đặt"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Dòng 2: Nút Thử Thách Hằng Ngày */}
        <div className="w-full flex justify-end pt-0">
          <DailyChallengeWidget
            stats={stats}
            onOpenModal={onOpenDailyChallenge}
            onUpdateStats={onUpdateStats}
          />
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 min-h-0 w-full max-w-xl mx-auto flex flex-col justify-center items-center text-center py-1 px-2 space-y-1 sm:space-y-2">
        {/* Title */}
        <div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight uppercase leading-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] filter">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-amber-200 via-amber-400 to-orange-500">
              SUBWAY RUNNER 3D
            </span>
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-[8px] sm:text-[10px] font-extrabold text-amber-300 tracking-widest uppercase flex items-center justify-center gap-2 drop-shadow">
          <span>RUN</span>
          <span className="text-amber-500">•</span>
          <span>DODGE</span>
          <span className="text-amber-500">•</span>
          <span>COLLECT</span>
        </p>

        {/* High Score & Longest Time Records */}
        <div className="bg-slate-900/80 border border-amber-500/30 p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl backdrop-blur-md shadow-2xl w-full max-w-xs sm:max-w-md">
          <div className="grid grid-cols-2 gap-0 text-center">
            <div>
              <div className="text-[9px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center justify-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>KỶ LỤC XA NHẤT</span>
              </div>
              <div className="text-base sm:text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-400 to-amber-300 font-mono leading-none my-1">
                {stats.highScore.toLocaleString()}m
              </div>
            </div>

            <div>
              <div className="text-[9px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>KỶ LỤC THỜI GIAN</span>
              </div>
              <div className="text-base sm:text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-400 to-cyan-400 font-mono leading-none my-1">
                {formatTime(stats.longestTime || 0)}
              </div>
            </div>
          </div>

          <div className="pt-0.5 border-t border-slate-800 text-[7px] sm:text-[10px] font-bold text-amber-400/90 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Trang bị: {stats.selectedCharacter} • {stats.selectedBoard}</span>
          </div>
        </div>

        {/* Big Prominent PLAY Button */}
        <button
          onClick={onPlay}
          className="group relative w-full max-w-xs sm:max-w-md py-1.5 sm:py-2 px-4 sm:px-10 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:from-amber-300 hover:to-red-400 text-slate-950 font-black text-base sm:text-lg lg:text-3xl rounded-full shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 sm:gap-3 border-2 border-amber-200/80 cursor-pointer"
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950 transition-transform group-hover:scale-110" />
          <span className="tracking-tight">PLAY</span>
        </button>
      </main>
    </div>
  );
};
