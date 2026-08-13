import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  coins: number;
  character: string;
  board: string;
  country: string;
  date: string;
}

// Pre-populated initial global leaderboard with competitive top players
const leaderboardData: LeaderboardEntry[] = [
  { id: '1', name: 'CyberRunner99', score: 285400, coins: 1420, character: 'Cyber Ninja', board: 'Neon Pulse', country: '🇻🇳', date: '2026-08-01' },
  { id: '2', name: 'JakeMaster_VN', score: 241200, coins: 1180, character: 'Jake Hero', board: 'Star Board', country: '🇻🇳', date: '2026-08-01' },
  { id: '3', name: 'SpeedDemon_SG', score: 198500, coins: 950, character: 'Tricky Skater', board: 'Flame Thruster', country: '🇸🇬', date: '2026-07-31' },
  { id: '4', name: 'TokyoDrifter', score: 176200, coins: 890, character: 'Yutani Tech', board: 'Cyber Hover', country: '🇯🇵', date: '2026-07-30' },
  { id: '5', name: 'GoldHunter_US', score: 154000, coins: 2100, character: 'Gold Emperor', board: 'Star Board', country: '🇺🇸', date: '2026-07-29' },
  { id: '6', name: 'SubwayPro_TH', score: 132100, coins: 640, character: 'Jake Hero', board: 'Flame Thruster', country: '🇹🇭', date: '2026-07-28' },
  { id: '7', name: 'NinjaRunner', score: 115000, coins: 520, character: 'Cyber Ninja', board: 'Neon Pulse', country: '🇻🇳', date: '2026-07-27' },
  { id: '8', name: 'VietRunner_01', score: 98400, coins: 430, character: 'Jake Hero', board: 'Star Board', country: '🇻🇳', date: '2026-07-26' },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', engine: 'Subway Surfers 3D High-Perf Engine', timestamp: new Date().toISOString() });
  });

  // Get Top Leaderboard
  app.get('/api/leaderboard', (_req, res) => {
    // Sort descending by score
    const sorted = [...leaderboardData].sort((a, b) => b.score - a.score);
    res.json({ leaderboard: sorted });
  });

  // Submit High Score
  app.post('/api/leaderboard', (req, res) => {
    const { name, score, coins, character, board, country } = req.body;
    if (!name || typeof score !== 'number') {
      res.status(400).json({ error: 'Dữ liệu không hợp lệ (Name và Score bắt buộc)' });
      return;
    }

    const newEntry: LeaderboardEntry = {
      id: Date.now().toString(),
      name: name.trim().slice(0, 16) || 'Nặc Danh',
      score: Math.floor(score),
      coins: Math.floor(coins || 0),
      character: character || 'Jake Hero',
      board: board || 'Star Board',
      country: country || '🇻🇳',
      date: new Date().toISOString().split('T')[0],
    };

    leaderboardData.push(newEntry);
    leaderboardData.sort((a, b) => b.score - a.score);

    // Find rank of submitted entry
    const rank = leaderboardData.findIndex((item) => item.id === newEntry.id) + 1;

    res.json({ success: true, rank, entry: newEntry });
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎮 Subway Surfers 3D Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
