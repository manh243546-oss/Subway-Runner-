import React from 'react';
import { PowerUpActiveState, ConsumableInventory, ComboState } from '../types';
import { Coins, Zap, Shield, Magnet, Rocket, Gauge, Sparkles, Settings, Gift, Clock, Footprints } from 'lucide-react';
import { formatTime } from '../utils/formatters';

interface GameOverlayProps {
  score: number;
  highScore: number;
  coins: number;
  distance?: number;
  runTime?: number;
  multiplier: number;
  consumables?: ConsumableInventory;
  activePowerups: PowerUpActiveState[];
  comboState?: ComboState;
  challengeCompletedToast?: string | null;
  onActivateConsumable?: (type: 'headstart' | 'magnet' | 'multiplier') => void;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
  onOpenDailyChallenge?: () => void;
  onToggleProfiler: () => void;
  showProfiler: boolean;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  score,
  highScore,
  coins,
  distance = 0,
  runTime = 0,
  multiplier,
  consumables,
  activePowerups,
  comboState,
  challengeCompletedToast,
  onActivateConsumable,
  onOpenShop,
  onOpenLeaderboard,
  onOpenSettings,
  onOpenDailyChallenge,
  onToggleProfiler,
  showProfiler,
}) => {
  const headstartQty = consumables?.headstartCount || 0;
  const magnetQty = consumables?.magnetBoostCount || 0;
  const boosterQty = consumables?.scoreBoosterCount || 0;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4 z-10 select-none">
      {/* Top Floating Header & Active Power-Ups Area */}
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="relative flex items-center justify-center w-full">
          {/* Singular Translucent Top-Center HUD Bar */}
          <div className="pointer-events-auto bg-slate-950/75 backdrop-blur-xl border border-slate-800/80 rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2 shadow-2xl flex items-center gap-2.5 sm:gap-4 transition-all max-w-[90vw] overflow-x-auto">
            {/* Distance */}
            <div className="flex items-center gap-1.5 sm:gap-2" title="Quãng đường đã đi">
              <Footprints className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
              <span className="text-sm sm:text-xl font-black text-cyan-300 font-mono tracking-tight leading-none">
                {distance.toLocaleString()}m
              </span>
            </div>

            <div className="w-px h-3.5 sm:h-4 bg-slate-700/60" />

            {/* Coins */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400 shrink-0" />
              <span className="text-xs sm:text-base font-black text-amber-300 font-mono tracking-tight">
                {coins.toLocaleString()}
              </span>
            </div>

            <div className="w-px h-3.5 sm:h-4 bg-slate-700/60" />

            {/* Time */}
            <div className="flex items-center gap-1 sm:gap-1.5" title="Thời gian đã chạy">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-base font-black text-emerald-300 font-mono tracking-tight">
                {formatTime(runTime)}
              </span>
            </div>

            {/* Multiplier Badge - Hidden unless > 1 to declutter HUD */}
            {multiplier > 1 && (
              <>
                <div className="w-px h-3.5 sm:h-4 bg-slate-700/60" />
                <div className="flex items-center gap-1 text-[10px] sm:text-xs font-black text-amber-400 bg-amber-500/20 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-500/40 animate-in fade-in zoom-in-95 duration-200">
                  <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                  <span>x{multiplier}</span>
                </div>
              </>
            )}
          </div>

          {/* In-Game Daily Challenge Completion Banner Toast */}
          {challengeCompletedToast && (
            <div className="mt-2 pointer-events-auto bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 px-4 py-2 rounded-2xl shadow-2xl border border-amber-300 font-black text-xs sm:text-sm flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
              <Gift className="w-5 h-5 fill-slate-950 animate-bounce shrink-0" />
              <span>{challengeCompletedToast}</span>
            </div>
          )}

          {/* Settings & Pause Button (Top-Right) */}
          <div className="absolute right-0 top-0 pointer-events-auto flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings();
              }}
              onTouchStart={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-2.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 text-cyan-400 hover:text-white rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95 touch-manipulation flex items-center gap-1.5 px-3"
              title="Cài Đặt / Tạm Dừng Game"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-black text-slate-200 hidden sm:inline">CÀI ĐẶT</span>
            </button>
          </div>
        </div>

        {/* Active Power-ups Bar (Moved to Top, ONLY showing remaining time without progress bar) */}
        {activePowerups.length > 0 && (
          <div className="flex items-center justify-center flex-wrap gap-1.5 pointer-events-auto animate-in fade-in slide-in-from-top-1 duration-200 z-20">
            {activePowerups.map((pup) => {
              let icon = <Zap className="w-3.5 h-3.5 text-amber-400" />;
              let badgeStyle = 'border-amber-500/40 bg-slate-950/85 text-amber-300';

              if (pup.type === 'magnet') {
                icon = <Magnet className="w-3.5 h-3.5 text-red-400" />;
                badgeStyle = 'border-red-500/40 bg-slate-950/85 text-red-300';
              } else if (pup.type === 'hoverboard') {
                icon = <Shield className="w-3.5 h-3.5 text-blue-400" />;
                badgeStyle = 'border-blue-500/40 bg-slate-950/85 text-blue-300';
              } else if (pup.type === 'jetpack') {
                icon = <Rocket className="w-3.5 h-3.5 text-emerald-400" />;
                badgeStyle = 'border-emerald-500/40 bg-slate-950/85 text-emerald-300';
              } else if (pup.type === 'sneakers') {
                icon = <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
                badgeStyle = 'border-purple-500/40 bg-slate-950/85 text-purple-300';
              }

              return (
                <div
                  key={pup.type}
                  className={`border rounded-full px-2.5 py-1 shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-all text-xs font-mono font-black ${badgeStyle}`}
                >
                  <div className="shrink-0">{icon}</div>
                  <span>{pup.duration.toFixed(0)}s</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Middle/Bottom Area: Consumable Action Triggers */}
      <div className="flex flex-col justify-end items-start gap-2 w-full pointer-events-none mb-2 sm:mb-4">
        {/* Consumable Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {headstartQty > 0 && (
            <button
              onClick={() => onActivateConsumable?.('headstart')}
              className="bg-emerald-600/80 hover:bg-emerald-500 border border-emerald-400/40 text-white px-2.5 py-1.5 rounded-full text-[11px] font-black shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-transform active:scale-95"
              title="Bay tên lửa"
            >
              <Rocket className="w-3.5 h-3.5 text-emerald-300 animate-bounce" />
              <span>TÊN LỬA ({headstartQty})</span>
            </button>
          )}

          {magnetQty > 0 && (
            <button
              onClick={() => onActivateConsumable?.('magnet')}
              className="bg-red-600/80 hover:bg-red-500 border border-red-400/40 text-white px-2.5 py-1.5 rounded-full text-[11px] font-black shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-transform active:scale-95"
              title="Nam châm hút vàng"
            >
              <Magnet className="w-3.5 h-3.5 text-red-300" />
              <span>NAM CHÂM ({magnetQty})</span>
            </button>
          )}

          {boosterQty > 0 && (
            <button
              onClick={() => onActivateConsumable?.('multiplier')}
              className="bg-amber-500/80 hover:bg-amber-400 border border-amber-300/40 text-slate-950 px-2.5 py-1.5 rounded-full text-[11px] font-black shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-transform active:scale-95"
              title="Nhân 5X điểm"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>+5X ĐIỂM ({boosterQty})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

