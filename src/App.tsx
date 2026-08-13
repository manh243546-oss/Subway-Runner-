import React, { useEffect, useRef, useState } from 'react';
import { SubwayEngine } from './game/SubwayEngine';
import { PlayerStats, PerformanceMetrics, PowerUpActiveState, ComboState } from './types';
import { GameOverlay } from './components/GameOverlay';
import { PerformanceProfiler } from './components/PerformanceProfiler';
import { ShopModal } from './components/ShopModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SettingsModal } from './components/SettingsModal';
import { GameOverModal } from './components/GameOverModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { ResumeCountdownOverlay } from './components/ResumeCountdownOverlay';
import { StartScreen } from './components/StartScreen';

const STORAGE_KEY = 'subway_surfers_3d_engine_save_v1';

const defaultStats: PlayerStats = {
  coins: 100, // Initial welcome coins
  totalCoinsCollected: 0,
  highScore: 1250,
  longestTime: 0,
  currentScore: 0,
  distance: 0,
  multiplier: 1,
  selectedCharacter: 'Jake Hero',
  selectedBoard: 'Star Board',
  unlockedCharacters: ['Jake Hero'],
  unlockedBoards: ['Star Board'],
  powerUpUpgrades: {
    magnetLevel: 1,
    hoverboardLevel: 1,
    jetpackLevel: 1,
    multiplierLevel: 1,
    sneakersLevel: 1,
  },
  consumables: {
    hoverboardCount: 5,
    headstartCount: 2,
    magnetBoostCount: 2,
    scoreBoosterCount: 2,
  },
  permanentUpgrades: {
    baseSpeedLevel: 1,
    baseMultiplierLevel: 1,
    magnetLevel: 1,
    hoverboardLevel: 1,
    jetpackLevel: 1,
    multiplierLevel: 1,
    sneakersLevel: 1,
  },
};

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SubwayEngine | null>(null);

  // Persistent Player Stats
  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultStats, ...JSON.parse(saved) };
      }
    } catch {
      // Ignored
    }
    return defaultStats;
  });

  // Game UI States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [isNewTimeRecord, setIsNewTimeRecord] = useState<boolean>(false);
  const [currentRunTime, setCurrentRunTime] = useState<number>(0);
  const [currentRunCoins, setCurrentRunCoins] = useState<number>(0);
  const [lastRunCoins, setLastRunCoins] = useState<number>(0);
  const [activePowerups, setActivePowerups] = useState<PowerUpActiveState[]>([]);
  const [comboState, setComboState] = useState<ComboState | undefined>(undefined);

  // Modals & Profiler
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showDailyChallenge, setShowDailyChallenge] = useState<boolean>(false);
  const [showProfiler, setShowProfiler] = useState<boolean>(false);
  const [challengeToast, setChallengeToast] = useState<string | null>(null);

  // Resume Countdown (3s standstill timer after closing settings/modals)
  const [resumeCountdown, setResumeCountdown] = useState<number | null>(null);

  // Audio
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(true);

  // Metrics
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  // Save to LocalStorage on stats update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Ignored
    }
  }, [stats]);

  // Cleanup game engine on unmount
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, []);

  // Window resize & ResizeObserver listener for dynamic viewport scaling
  useEffect(() => {
    const handleResize = () => {
      if (engineRef.current) {
        engineRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  // Auto-pause game engine when pop-up modals or 3s countdown are active during gameplay
  useEffect(() => {
    if (isPlaying && engineRef.current) {
      if (
        showShop ||
        showLeaderboard ||
        showSettings ||
        showDailyChallenge ||
        resumeCountdown !== null
      ) {
        engineRef.current.pause();
      } else {
        engineRef.current.resume();
      }
    }
  }, [
    showShop,
    showLeaderboard,
    showSettings,
    showDailyChallenge,
    resumeCountdown,
    isPlaying,
  ]);

  // Handle 3-second resume countdown timer when closing modals during gameplay
  useEffect(() => {
    if (resumeCountdown === null) return;

    if (resumeCountdown > 0) {
      const timer = setTimeout(() => {
        setResumeCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : 0));
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown reached 0 ("GO!"), display for 500ms then clear to resume
      const timer = setTimeout(() => {
        setResumeCountdown(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [resumeCountdown]);

  // Modal Close Handlers with 3s standstill countdown when closing during active gameplay
  const triggerResumeCountdownIfPlaying = () => {
    if (isPlaying) {
      setResumeCountdown(3);
    }
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
    triggerResumeCountdownIfPlaying();
  };

  const handleResumeFromSettings = () => {
    setShowSettings(false);
    triggerResumeCountdownIfPlaying();
  };

  const handleExitToLobby = () => {
    setShowSettings(false);
    setResumeCountdown(null);
    if (engineRef.current) {
      engineRef.current.resetToIdle();
    }
    setIsPlaying(false);
    setIsGameOver(false);
  };

  const handleEndGameFromSettings = () => {
    setShowSettings(false);
    setResumeCountdown(null);
    if (engineRef.current) {
      engineRef.current.triggerGameOver();
    } else {
      setIsPlaying(false);
      setIsGameOver(true);
    }
  };

  const handleCloseShop = () => {
    setShowShop(false);
    triggerResumeCountdownIfPlaying();
  };

  const handleCloseLeaderboard = () => {
    setShowLeaderboard(false);
    triggerResumeCountdownIfPlaying();
  };

  const handleCloseDailyChallenge = () => {
    setShowDailyChallenge(false);
    triggerResumeCountdownIfPlaying();
  };

  // Start 3D Engine Session
  const startGame = () => {
    if (!containerRef.current) return;

    if (engineRef.current) {
      engineRef.current.dispose();
      engineRef.current = null;
    }

    const engine = new SubwayEngine(containerRef.current, stats, {
      onGameOver: (finalScore, coinsEarned, finalRunTime, finalDistance) => {
        setIsPlaying(false);
        setIsGameOver(true);
        setResumeCountdown(null);

        const newHighScore = Math.max(stats.highScore, finalDistance);
        const newRecord = finalDistance > stats.highScore;

        const prevLongest = stats.longestTime || 0;
        const newLongest = Math.max(prevLongest, finalRunTime);
        const newTimeRecord = finalRunTime > prevLongest && finalRunTime > 0;

        setIsNewRecord(newRecord);
        setIsNewTimeRecord(newTimeRecord);
        setCurrentRunTime(finalRunTime);
        setLastRunCoins(coinsEarned);

        setStats((prev) => ({
          ...prev,
          coins: prev.coins + coinsEarned,
          totalCoinsCollected: (prev.totalCoinsCollected || 0) + coinsEarned,
          highScore: newHighScore,
          longestTime: newLongest,
          currentScore: finalScore,
          distance: finalDistance,
        }));
      },
      onStatsUpdate: (updatedStats, activePups, comboInfo, runTimeSec) => {
        setCurrentRunCoins(updatedStats.coins);
        setStats((prev) => ({
          ...prev,
          currentScore: updatedStats.currentScore,
          distance: updatedStats.distance,
          multiplier: updatedStats.multiplier,
          dailyChallenge: updatedStats.dailyChallenge,
          consumables: updatedStats.consumables,
        }));
        if (typeof runTimeSec === 'number') {
          setCurrentRunTime(runTimeSec);
        }
        setActivePowerups(activePups);
        setComboState(comboInfo);
      },
      onPerformanceUpdate: (perfMetrics) => {
        setMetrics(perfMetrics);
      },
      onDailyChallengeCompleted: (def) => {
        setChallengeToast(`HOÀN THÀNH THỬ THÁCH: ${def.title}! (+${def.rewardCoins} Xu)`);
        setTimeout(() => setChallengeToast(null), 5000);
      },
    });

    engine.start();

    engineRef.current = engine;
    setIsPlaying(true);
    setIsGameOver(false);
    setResumeCountdown(null);
    setCurrentRunTime(0);
    setCurrentRunCoins(0);
    setIsNewTimeRecord(false);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none text-white">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Playing Game HUD */}
      {isPlaying && (
        <>
          <GameOverlay
            score={stats.currentScore}
            highScore={stats.highScore}
            coins={currentRunCoins}
            distance={stats.distance}
            runTime={currentRunTime}
            multiplier={stats.multiplier}
            consumables={stats.consumables}
            activePowerups={activePowerups}
            comboState={comboState}
            challengeCompletedToast={challengeToast}
            onActivateConsumable={(type) => {
              if (engineRef.current) {
                engineRef.current.activateConsumable(type);
              }
            }}
            onOpenShop={() => setShowShop(true)}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenSettings={() => setShowSettings(true)}
            onOpenDailyChallenge={() => setShowDailyChallenge(true)}
            onToggleProfiler={() => setShowProfiler((prev) => !prev)}
            showProfiler={showProfiler}
          />
        </>
      )}

      {/* Main Start Lobby Screen */}
      {!isPlaying && !isGameOver && (
        <StartScreen
          stats={stats}
          onPlay={startGame}
          onOpenShop={() => setShowShop(true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenDailyChallenge={() => setShowDailyChallenge(true)}
          onUpdateStats={(newStats) => setStats(newStats)}
        />
      )}

      {/* Performance Profiler Overlay */}
      {showProfiler && <PerformanceProfiler metrics={metrics} onClose={() => setShowProfiler(false)} />}

      {/* Resume Countdown Overlay (3s Pause Standstill) */}
      {isPlaying && resumeCountdown !== null && (
        <ResumeCountdownOverlay countdown={resumeCountdown} />
      )}

      {/* Shop Modal */}
      {showShop && (
        <ShopModal
          stats={stats}
          onUpdateStats={(newStats) => {
            setStats(newStats);
            if (engineRef.current) {
              engineRef.current.updatePlayerStats(newStats);
            }
          }}
          onClose={handleCloseShop}
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          currentScore={stats.distance}
          coinsCollected={stats.coins}
          characterUsed={stats.selectedCharacter}
          boardUsed={stats.selectedBoard}
          onClose={handleCloseLeaderboard}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          soundEnabled={soundEnabled}
          onToggleSound={setSoundEnabled}
          musicEnabled={musicEnabled}
          onToggleMusic={setMusicEnabled}
          onClose={handleCloseSettings}
          isPlaying={isPlaying}
          onResume={handleResumeFromSettings}
          onExitToLobby={handleExitToLobby}
          onEndGame={handleEndGameFromSettings}
          onOpenShop={() => {
            setShowSettings(false);
            setShowShop(true);
          }}
          onOpenLeaderboard={() => {
            setShowSettings(false);
            setShowLeaderboard(true);
          }}
          onOpenDailyChallenge={() => {
            setShowSettings(false);
            setShowDailyChallenge(true);
          }}
        />
      )}

      {/* Daily Challenge Modal */}
      {showDailyChallenge && (
        <DailyChallengeModal
          stats={stats}
          onUpdateStats={(newStats) => setStats(newStats)}
          onClose={handleCloseDailyChallenge}
        />
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <GameOverModal
          score={stats.currentScore}
          highScore={stats.highScore}
          coins={lastRunCoins}
          distance={stats.distance}
          runTime={currentRunTime}
          longestTime={stats.longestTime || 0}
          isNewRecord={isNewRecord}
          isNewTimeRecord={isNewTimeRecord}
          stats={stats}
          onRestart={startGame}
          onReturnToMenu={() => {
            if (engineRef.current) {
              engineRef.current.resetToIdle();
            }
            setIsPlaying(false);
            setIsGameOver(false);
          }}
          onOpenShop={() => setShowShop(true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenDailyChallenge={() => setShowDailyChallenge(true)}
        />
      )}
    </div>
  );
}
