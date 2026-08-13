import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Shield, Eye, EyeOff } from 'lucide-react';

interface TouchControlsProps {
  hoverboardCount?: number;
  onAction: (action: 'left' | 'right' | 'jump' | 'roll' | 'hoverboard') => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ hoverboardCount = 0, onAction }) => {
  const [controlsVisible, setControlsVisible] = useState(true);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-end p-2 sm:p-4 select-none">
      {/* Quick Touch Controls Visibility Toggle */}
      <div className="pointer-events-auto self-end mb-2 mr-1">
        <button
          onClick={() => setControlsVisible((prev) => !prev)}
          className="p-1.5 bg-slate-950/60 hover:bg-slate-900 border border-slate-700/50 text-slate-400 hover:text-white rounded-lg text-[10px] font-semibold backdrop-blur-sm flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
          title={controlsVisible ? "Ẩn phím cảm ứng (chơi bằng Bàn Phím)" : "Hiện phím cảm ứng"}
        >
          {controlsVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
          <span className="hidden sm:inline">{controlsVisible ? "Ẩn Phím" : "Hiện Phím"}</span>
        </button>
      </div>

      {/* Mobile Touch Overlay Pad */}
      {controlsVisible && (
        <div className="flex items-end justify-between w-full max-w-lg mx-auto pb-2 opacity-75 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
          {/* Left / Right D-Pad */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                onAction('left');
              }}
              onClick={() => onAction('left')}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-950/75 active:bg-cyan-500/40 border border-cyan-500/30 active:border-cyan-400 rounded-xl flex flex-col items-center justify-center text-cyan-300 shadow-lg backdrop-blur-md transition-transform active:scale-90"
              title="Sang Trái (Phím A / Mũi Tên Trái)"
              aria-label="Trái"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span className="text-[8px] sm:text-[9px] font-black tracking-tight mt-0.5">TRÁI</span>
            </button>

            <button
              onTouchStart={(e) => {
                e.preventDefault();
                onAction('right');
              }}
              onClick={() => onAction('right')}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-950/75 active:bg-cyan-500/40 border border-cyan-500/30 active:border-cyan-400 rounded-xl flex flex-col items-center justify-center text-cyan-300 shadow-lg backdrop-blur-md transition-transform active:scale-90"
              title="Sang Phải (Phím D / Mũi Tên Phải)"
              aria-label="Phải"
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span className="text-[8px] sm:text-[9px] font-black tracking-tight mt-0.5">PHẢI</span>
            </button>
          </div>

          {/* Hoverboard Quick Trigger Button */}
          <div className="pointer-events-auto relative">
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                onAction('hoverboard');
              }}
              onClick={() => onAction('hoverboard')}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600/90 to-indigo-700/90 active:from-blue-500 active:to-indigo-600 border border-blue-400/40 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl backdrop-blur-md transition-transform active:scale-90 relative"
              title="Kích Hoạt Ván Trượt (Double Tap Space / Click)"
            >
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[9px] sm:text-[10px] font-black tracking-tight mt-0.5">VÁN TRƯỢT</span>
              {hoverboardCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full border border-slate-900 shadow-md">
                  x{hoverboardCount}
                </span>
              )}
            </button>
          </div>

          {/* Jump / Roll Action Buttons */}
          <div className="pointer-events-auto flex flex-col items-center gap-1.5">
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                onAction('jump');
              }}
              onClick={() => onAction('jump')}
              className="w-12 h-10 sm:w-14 sm:h-11 bg-slate-950/75 active:bg-emerald-500/40 border border-emerald-500/30 active:border-emerald-400 rounded-xl flex flex-col items-center justify-center text-emerald-300 shadow-lg backdrop-blur-md transition-transform active:scale-90"
              title="Nhảy (W / Space / Mũi Tên Lên)"
              aria-label="Nhảy"
            >
              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span className="text-[8px] sm:text-[9px] font-black tracking-tight">NHẢY</span>
            </button>

            <button
              onTouchStart={(e) => {
                e.preventDefault();
                onAction('roll');
              }}
              onClick={() => onAction('roll')}
              className="w-12 h-10 sm:w-14 sm:h-11 bg-slate-950/75 active:bg-amber-500/40 border border-amber-500/30 active:border-amber-400 rounded-xl flex flex-col items-center justify-center text-amber-300 shadow-lg backdrop-blur-md transition-transform active:scale-90"
              title="Lộn Cúi (S / Mũi Tên Xuống)"
              aria-label="Lộn Cúi"
            >
              <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span className="text-[8px] sm:text-[9px] font-black tracking-tight">LỘN</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
