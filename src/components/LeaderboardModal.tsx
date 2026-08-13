import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../types';
import { Trophy, Send, CheckCircle2, RefreshCw } from 'lucide-react';

interface LeaderboardModalProps {
  currentScore?: number;
  coinsCollected?: number;
  characterUsed?: string;
  boardUsed?: string;
  onClose: () => void;
}

interface DisplayEntry extends LeaderboardEntry {
  isUser?: boolean;
}

const INITIAL_MOCK_LEADERBOARD: DisplayEntry[] = [
  { id: 'bot-1', name: 'SpeedDemon_X', score: 25400, coins: 0, character: '', board: '', country: '🇺🇸', date: '2026-08-01' },
  { id: 'bot-2', name: 'TokyoDrifter_99', score: 22180, coins: 0, character: '', board: '', country: '🇯🇵', date: '2026-08-01' },
  { id: 'bot-3', name: 'CyberRunner_Asia', score: 19850, coins: 0, character: '', board: '', country: '🇸🇬', date: '2026-08-01' },
  { id: 'bot-4', name: 'TrickySkater', score: 17620, coins: 0, character: '', board: '', country: '🇬🇧', date: '2026-07-31' },
  { id: 'bot-5', name: 'GoldHunter_SG', score: 15400, coins: 0, character: '', board: '', country: '🇸🇬', date: '2026-07-31' },
  { id: 'bot-6', name: 'KR_SubwayGod', score: 13210, coins: 0, character: '', board: '', country: '🇰🇷', date: '2026-07-30' },
  { id: 'bot-7', name: 'NinjaDash_DE', score: 11500, coins: 0, character: '', board: '', country: '🇩🇪', date: '2026-07-30' },
  { id: 'bot-8', name: 'RioSpeedster', score: 9840, coins: 0, character: '', board: '', country: '🇧🇷', date: '2026-07-29' },
  { id: 'bot-9', name: 'ParisExpress', score: 8300, coins: 0, character: '', board: '', country: '🇫🇷', date: '2026-07-29' },
  { id: 'bot-10', name: 'LionCity_Pro', score: 6950, coins: 0, character: '', board: '', country: '🇲🇾', date: '2026-07-28' },
  { id: 'bot-11', name: 'MetroRider_CA', score: 5600, coins: 0, character: '', board: '', country: '🇨🇦', date: '2026-07-28' },
  { id: 'bot-12', name: 'AussieSurfer', score: 4250, coins: 0, character: '', board: '', country: '🇦🇺', date: '2026-07-27' },
  { id: 'bot-13', name: 'RomaRunner', score: 2900, coins: 0, character: '', board: '', country: '🇮🇹', date: '2026-07-27' },
  { id: 'bot-14', name: 'Velocity_ES', score: 1200, coins: 0, character: '', board: '', country: '🇪🇸', date: '2026-07-26' },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  currentScore = 0,
  coinsCollected = 0,
  characterUsed = 'Jake Hero',
  boardUsed = 'Star Board',
  onClose,
}) => {
  const [leaderboard, setLeaderboard] = useState<DisplayEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [playerName, setPlayerName] = useState<string>('GameThudepTrai');
  const [countryFlag, setCountryFlag] = useState<string>('🇺🇸');
  const [submittedRank, setSubmittedRank] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [userEntry, setUserEntry] = useState<DisplayEntry | null>(null);

  const mergeAndSortLeaderboard = (fetchedList: LeaderboardEntry[], currentUser?: DisplayEntry | null) => {
    const map = new Map<string, DisplayEntry>();

    // Add initial mock list
    INITIAL_MOCK_LEADERBOARD.forEach((item) => map.set(item.id, { ...item }));

    // Add server fetched list if any
    fetchedList.forEach((item) => {
      map.set(item.id || item.name, { ...item });
    });

    // Add current user if submitted
    if (currentUser) {
      map.set('user_current', currentUser);
    }

    const merged = Array.from(map.values());
    merged.sort((a, b) => b.score - a.score);

    return merged;
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      const serverEntries: LeaderboardEntry[] = data.leaderboard || [];
      const merged = mergeAndSortLeaderboard(serverEntries, userEntry);
      setLeaderboard(merged);
    } catch (err) {
      console.error('Lỗi tải BXH:', err);
      const merged = mergeAndSortLeaderboard([], userEntry);
      setLeaderboard(merged);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || currentScore <= 0 || submitting) return;

    setSubmitting(true);
    const newUserEntry: DisplayEntry = {
      id: 'user_current',
      name: playerName.trim(),
      score: currentScore,
      coins: coinsCollected,
      character: characterUsed,
      board: boardUsed,
      country: countryFlag,
      date: new Date().toISOString().split('T')[0],
      isUser: true,
    };

    setUserEntry(newUserEntry);

    try {
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerName.trim(),
          score: currentScore,
          coins: coinsCollected,
          character: characterUsed,
          board: boardUsed,
          country: countryFlag,
        }),
      });
    } catch (err) {
      console.error('Lỗi nộp điểm lên server:', err);
    } finally {
      const merged = mergeAndSortLeaderboard(leaderboard, newUserEntry);
      setLeaderboard(merged);
      const calculatedRank = merged.findIndex((item) => item.isUser || item.id === 'user_current') + 1;
      setSubmittedRank(calculatedRank);
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="bg-slate-900/95 border border-slate-700/90 rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
              <h2 className="text-base sm:text-lg font-black text-cyan-400 tracking-tight">
                BẢNG XẾP HẠNG GLOBAL
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeaderboard}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold transition-all cursor-pointer"
              title="Cập nhật danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 text-red-300 font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              ✕ ĐÓNG
            </button>
          </div>
        </div>

        {/* High Score Submission Banner */}
        {currentScore > 0 && (
          <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border-b border-amber-500/30 p-3.5 shrink-0">
            {submittedRank ? (
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  Đã ghi danh thành công! Hạng của bạn: <strong className="text-amber-300 font-black text-sm">#{submittedRank}</strong> ({currentScore.toLocaleString()}m)
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmitScore} className="flex flex-col gap-2">
                <div className="text-[11px] font-bold text-amber-300 flex items-center justify-between">
                  <span>🏆 NỘP KỶ LỤC VÀO BẢNG XẾP HẠNG:</span>
                  <span className="font-mono text-white text-xs">{currentScore.toLocaleString()}m</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Tên Game Thủ"
                    maxLength={16}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400 min-w-0"
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 transition-all shadow-md shrink-0 cursor-pointer active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>NỘP</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Table Header Row */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 text-[10px] font-black uppercase text-slate-400 grid grid-cols-12 gap-2 items-center shrink-0">
          <div className="col-span-2 text-center">HẠNG (#)</div>
          <div className="col-span-6">TÊN NGƯỜI CHƠI</div>
          <div className="col-span-4 text-right">QUÃNG ĐƯỜNG</div>
        </div>

        {/* Leaderboard Table List */}
        <div className="p-3 overflow-y-auto flex-1 space-y-1.5 custom-scrollbar">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs font-medium">Đang kết nối hệ thống máy chủ...</div>
          ) : leaderboard.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">Chưa có ai lập kỷ lục. Hãy là người đầu tiên!</div>
          ) : (
            leaderboard.map((entry, idx) => {
              const rank = idx + 1;
              const isUser = entry.isUser || entry.id === 'user_current';

              let rankBadge = <span className="font-mono font-bold text-slate-400 text-xs">#{rank}</span>;

              if (rank === 1) {
                rankBadge = <span className="text-base">🥇</span>;
              } else if (rank === 2) {
                rankBadge = <span className="text-base">🥈</span>;
              } else if (rank === 3) {
                rankBadge = <span className="text-base">🥉</span>;
              }

              return (
                <div
                  key={entry.id || idx}
                  className={`border rounded-xl px-3 py-2 grid grid-cols-12 gap-2 items-center transition-all ${
                    isUser
                      ? 'border-amber-400/80 bg-amber-500/20 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/50'
                      : rank === 1
                      ? 'border-amber-400/50 bg-amber-500/10'
                      : rank === 2
                      ? 'border-slate-400/30 bg-slate-800/40'
                      : rank === 3
                      ? 'border-amber-700/30 bg-amber-900/10'
                      : 'border-slate-800/60 bg-slate-950/40 hover:border-slate-700'
                  }`}
                >
                  {/* Rank (#) */}
                  <div className="col-span-2 flex items-center justify-center font-bold">
                    {rankBadge}
                  </div>

                  {/* Country + Name */}
                  <div className="col-span-6 flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">{entry.country || '🇻🇳'}</span>
                    <span className={`font-bold text-xs truncate ${isUser ? 'text-amber-300 font-black' : 'text-slate-100'}`}>
                      {entry.name}
                    </span>
                    {isUser && (
                      <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase shrink-0">
                        BẠN
                      </span>
                    )}
                  </div>

                  {/* Distance (meters) */}
                  <div className="col-span-4 text-right">
                    <span className="text-xs sm:text-sm font-black text-cyan-300 font-mono tracking-tight">
                      {entry.score.toLocaleString()}m
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sticky Footer Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-slate-400 font-medium px-1">
            Kỷ lục hiện tại: <strong className="text-cyan-300 font-mono text-xs sm:text-sm">{currentScore.toLocaleString()}m</strong>
            {submittedRank && <span className="text-amber-400 font-bold ml-1.5">(Hạng #{submittedRank})</span>}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:from-amber-300 hover:to-red-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            <span>ĐÓNG & TIẾP TỤC CHẠY</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};
