import React from 'react';
import { Settings, Volume2, VolumeX, Music, ShoppingBag, Trophy, Calendar, Play, LogOut, Flag } from 'lucide-react';

interface SettingsModalProps {
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  musicEnabled: boolean;
  onToggleMusic: (enabled: boolean) => void;
  onClose: () => void;
  isPlaying?: boolean;
  onResume?: () => void;
  onExitToLobby?: () => void;
  onEndGame?: () => void;
  onOpenShop?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenDailyChallenge?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  soundEnabled,
  onToggleSound,
  musicEnabled,
  onToggleMusic,
  onClose,
  isPlaying,
  onResume,
  onExitToLobby,
  onEndGame,
  onOpenShop,
  onOpenLeaderboard,
  onOpenDailyChallenge,
}) => {
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="bg-slate-900/95 border border-slate-700/90 rounded-2xl w-full max-w-sm p-4 sm:p-5 shadow-2xl text-slate-100 space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm sm:text-base font-black text-white">CÀI ĐẶT GAME</h2>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
          >
            ✕ ĐÓNG
          </button>
        </div>

        {/* In-Game Action Controls (Tiếp tục, Thoát, Kết thúc) */}
        {(isPlaying || onResume || onExitToLobby || onEndGame) && (
          <div className="p-3 bg-slate-950/90 border border-cyan-500/30 rounded-xl space-y-2 shadow-md">
            <div className="text-[10px] font-black tracking-wider text-cyan-400 uppercase flex items-center justify-between">
              <span>🎮 TRẠNG THÁI GAME: TẠM DỪNG</span>
              <span className="text-slate-400 font-normal">Thao tác</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* 1. Nút TIẾP TỤC */}
              <button
                onClick={() => {
                  if (onResume) onResume();
                  else onClose();
                }}
                className="p-2.5 bg-gradient-to-b from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>TIẾP TỤC</span>
              </button>

              {/* 2. Nút THOÁT */}
              <button
                onClick={() => {
                  if (onExitToLobby) onExitToLobby();
                  else onClose();
                }}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-300 font-bold text-xs rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-amber-400" />
                <span>THOÁT</span>
              </button>

              {/* 3. Nút KẾT THÚC */}
              <button
                onClick={() => {
                  if (onEndGame) onEndGame();
                  else onClose();
                }}
                className="p-2.5 bg-gradient-to-b from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-xs rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Flag className="w-4 h-4 text-red-200" />
                <span>KẾT THÚC</span>
              </button>
            </div>
          </div>
        )}

        {/* Audio Toggles */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />}
              <div>
                <div className="text-xs font-bold text-white">Âm Thanh Hiệu Ứng (SFX)</div>
                <div className="text-[10px] text-slate-400">Tiếng nhảy, nhặt vàng, va chạm</div>
              </div>
            </div>

            <button
              onClick={() => onToggleSound(!soundEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative border shrink-0 cursor-pointer ${
                soundEnabled ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-800 border-slate-700'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  soundEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Music className={`w-4 h-4 shrink-0 ${musicEnabled ? 'text-purple-400' : 'text-slate-500'}`} />
              <div>
                <div className="text-xs font-bold text-white">Nhạc Nền Synthwave (BGM)</div>
                <div className="text-[10px] text-slate-400">Nhạc game sôi động kịch tính</div>
              </div>
            </div>

            <button
              onClick={() => onToggleMusic(!musicEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative border shrink-0 cursor-pointer ${
                musicEnabled ? 'bg-purple-600 border-purple-500' : 'bg-slate-800 border-slate-700'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  musicEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Shortcuts for other features while paused */}
        {(onOpenShop || onOpenLeaderboard || onOpenDailyChallenge) && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            {onOpenShop && (
              <button
                onClick={() => {
                  onClose();
                  onOpenShop();
                }}
                className="p-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>Cửa Hàng</span>
              </button>
            )}
            {onOpenLeaderboard && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLeaderboard();
                }}
                className="p-2 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                <span>BXH Global</span>
              </button>
            )}
            {onOpenDailyChallenge && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDailyChallenge();
                }}
                className="p-2 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                <span>Thử Thách</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
