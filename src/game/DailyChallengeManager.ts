import { PlayerStats, DailyChallengeState, DailyTaskState } from '../types';

export interface DailyObjectiveDef {
  id: string;
  type: 'collect_coins' | 'run_distance' | 'dodge_combo' | 'use_hoverboard' | 'collect_powerups' | 'score_points';
  title: string;
  description: string;
  targetValue: number;
  rewardCoins: number;
  rewardHoverboards?: number;
  icon: string;
  color: string;
}

export const DEFAULT_3_TASKS: Omit<DailyTaskState, 'currentProgress' | 'claimed' | 'completedAt'>[] = [
  {
    id: 'dc_dist_300',
    type: 'run_distance',
    title: 'Chạy 300m',
    description: 'Chạy quãng đường tích lũy đạt 300 mét trong lượt chơi.',
    targetValue: 300,
    rewardCoins: 500,
    rewardHoverboards: 1,
    icon: '🏃',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'dc_coins_50',
    type: 'collect_coins',
    title: 'Nhặt 50 xu',
    description: 'Thu thập tổng cộng 50 Xu Vàng trên đường chạy.',
    targetValue: 50,
    rewardCoins: 600,
    rewardHoverboards: 1,
    icon: '🪙',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    id: 'dc_dodge_20',
    type: 'dodge_combo',
    title: 'Né tránh 20 chướng ngại',
    description: 'Né tránh thành công 20 lượt chướng ngại vật.',
    targetValue: 20,
    rewardCoins: 800,
    rewardHoverboards: 2,
    icon: '⚡',
    color: 'from-purple-500 to-pink-500',
  },
];

export class DailyChallengeManager {
  /**
   * Get formatted today date key: YYYY-MM-DD
   */
  public static getTodayDateKey(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Generate 3 tasks for the date key
   */
  public static get3TasksForDate(dateKey: string): DailyTaskState[] {
    return DEFAULT_3_TASKS.map((task) => ({
      ...task,
      id: `${task.id}_${dateKey}`,
      currentProgress: 0,
      claimed: false,
    }));
  }

  /**
   * Get primary/active challenge metadata definition for legacy fallback
   */
  public static getChallengeDef(challengeId: string): DailyObjectiveDef {
    const matched = DEFAULT_3_TASKS.find((t) => challengeId.startsWith(t.id));
    if (matched) {
      return { ...matched, id: matched.id };
    }
    return {
      id: DEFAULT_3_TASKS[0].id,
      type: DEFAULT_3_TASKS[0].type,
      title: DEFAULT_3_TASKS[0].title,
      description: DEFAULT_3_TASKS[0].description,
      targetValue: DEFAULT_3_TASKS[0].targetValue,
      rewardCoins: DEFAULT_3_TASKS[0].rewardCoins,
      rewardHoverboards: DEFAULT_3_TASKS[0].rewardHoverboards,
      icon: DEFAULT_3_TASKS[0].icon,
      color: DEFAULT_3_TASKS[0].color,
    };
  }

  /**
   * Ensure player stats has initialized/up-to-date daily challenge for today
   */
  public static ensureDailyChallenge(stats: PlayerStats): { updatedStats: PlayerStats; isNewDay: boolean } {
    const todayKey = this.getTodayDateKey();
    const existingDc = stats.dailyChallenge;

    if (!existingDc || existingDc.dateKey !== todayKey || !existingDc.tasks || existingDc.tasks.length === 0) {
      const newTasks = this.get3TasksForDate(todayKey);
      const newChallengeState: DailyChallengeState = {
        dateKey: todayKey,
        tasks: newTasks,
        // Legacy fields for backward compatibility
        challengeId: newTasks[0].id,
        currentProgress: newTasks[0].currentProgress,
        targetValue: newTasks[0].targetValue,
        claimed: newTasks[0].claimed,
        rewardCoins: newTasks[0].rewardCoins,
        rewardHoverboards: newTasks[0].rewardHoverboards,
      };

      return {
        updatedStats: {
          ...stats,
          dailyChallenge: newChallengeState,
        },
        isNewDay: true,
      };
    }

    return { updatedStats: stats, isNewDay: false };
  }

  /**
   * Real-time progress update for matching tasks
   */
  public static updateProgress(
    stats: PlayerStats,
    type: 'collect_coins' | 'run_distance' | 'dodge_combo' | 'use_hoverboard' | 'collect_powerups' | 'score_points',
    amount: number
  ): { updatedStats: PlayerStats; newlyCompletedTasks: DailyTaskState[]; newlyCompleted: boolean } {
    const { updatedStats } = this.ensureDailyChallenge(stats);
    const dc = updatedStats.dailyChallenge!;
    const newlyCompletedTasks: DailyTaskState[] = [];

    let updatedAny = false;
    const updatedTasks = dc.tasks.map((task) => {
      if (task.type !== type || task.claimed) {
        return task;
      }

      let newProgress = task.currentProgress;
      if (type === 'score_points') {
        newProgress = Math.max(task.currentProgress, amount);
      } else {
        newProgress = task.currentProgress + amount;
      }

      newProgress = Math.min(newProgress, task.targetValue);
      const wasCompleted = task.currentProgress >= task.targetValue;
      const isNowCompleted = newProgress >= task.targetValue;

      if (newProgress !== task.currentProgress) {
        updatedAny = true;
      }

      const updatedTask: DailyTaskState = {
        ...task,
        currentProgress: newProgress,
        completedAt: !wasCompleted && isNowCompleted ? Date.now() : task.completedAt,
      };

      if (!wasCompleted && isNowCompleted) {
        newlyCompletedTasks.push(updatedTask);
      }

      return updatedTask;
    });

    if (!updatedAny && newlyCompletedTasks.length === 0) {
      return { updatedStats, newlyCompletedTasks: [], newlyCompleted: false };
    }

    // Sync legacy properties with task 0
    const primaryTask = updatedTasks[0] || dc.tasks[0];
    const updatedDcState: DailyChallengeState = {
      ...dc,
      tasks: updatedTasks,
      challengeId: primaryTask?.id,
      currentProgress: primaryTask?.currentProgress ?? 0,
      targetValue: primaryTask?.targetValue ?? 100,
      claimed: primaryTask?.claimed ?? false,
      rewardCoins: primaryTask?.rewardCoins ?? 500,
      rewardHoverboards: primaryTask?.rewardHoverboards ?? 0,
    };

    const newStats: PlayerStats = {
      ...updatedStats,
      dailyChallenge: updatedDcState,
    };

    return {
      updatedStats: newStats,
      newlyCompletedTasks,
      newlyCompleted: newlyCompletedTasks.length > 0,
    };
  }

  /**
   * Claim completion reward for a specific task ID
   */
  public static claimTaskReward(
    stats: PlayerStats,
    taskId: string
  ): { success: boolean; message: string; updatedStats?: PlayerStats } {
    const { updatedStats } = this.ensureDailyChallenge(stats);
    const dc = updatedStats.dailyChallenge!;

    const targetTask = dc.tasks.find((t) => t.id === taskId);
    if (!targetTask) {
      return { success: false, message: 'Không tìm thấy nhiệm vụ!' };
    }

    if (targetTask.claimed) {
      return { success: false, message: 'Bạn đã nhận phần thưởng nhiệm vụ này rồi!' };
    }

    if (targetTask.currentProgress < targetTask.targetValue) {
      return { success: false, message: 'Nhiệm vụ chưa hoàn thành!' };
    }

    const currentCoins = updatedStats.coins || 0;
    const currentHoverboards = updatedStats.consumables?.hoverboardCount || 0;

    const newCoins = currentCoins + targetTask.rewardCoins;
    const newHoverboards = currentHoverboards + (targetTask.rewardHoverboards || 0);

    const updatedTasks = dc.tasks.map((t) =>
      t.id === taskId ? { ...t, claimed: true } : t
    );

    const primaryTask = updatedTasks[0];

    const newStats: PlayerStats = {
      ...updatedStats,
      coins: newCoins,
      dailyChallenge: {
        ...dc,
        tasks: updatedTasks,
        claimed: primaryTask?.claimed ?? false,
      },
      consumables: {
        ...(updatedStats.consumables || {
          hoverboardCount: 5,
          headstartCount: 2,
          magnetBoostCount: 2,
          scoreBoosterCount: 2,
        }),
        hoverboardCount: newHoverboards,
      },
    };

    return {
      success: true,
      message: `Nhận thành công +${targetTask.rewardCoins} Xu${
        targetTask.rewardHoverboards ? ` & +${targetTask.rewardHoverboards} Ván` : ''
      }! 🎉`,
      updatedStats: newStats,
    };
  }

  /**
   * Legacy claim method
   */
  public static claimReward(stats: PlayerStats): { success: boolean; message: string; updatedStats?: PlayerStats } {
    const { updatedStats } = this.ensureDailyChallenge(stats);
    const dc = updatedStats.dailyChallenge!;

    const claimableTask = dc.tasks.find((t) => t.currentProgress >= t.targetValue && !t.claimed);
    if (claimableTask) {
      return this.claimTaskReward(updatedStats, claimableTask.id);
    }

    return { success: false, message: 'Chưa có nhiệm vụ hoàn thành nào để nhận thưởng!' };
  }
}
