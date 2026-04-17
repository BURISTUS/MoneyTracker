import { useDataStore } from '../stores/dataStore';
import { getLevelFromXp, getLevelProgress, getXpForLevel } from '../utils/formatters';
import { GAMIFICATION_STATUS_LABELS, GamificationStatus } from '../types';

export const useGamification = () => {
  const gamification = useDataStore((s) => s.gamification);
  const fetchGamification = useDataStore((s) => s.fetchGamification);
  const addXp = useDataStore((s) => s.addXp);

  const xp = gamification?.xp ?? 0;
  const level = gamification?.level ?? 1;
  const status = gamification?.status ?? GamificationStatus.CONSUMER_DRONE;
  const progress = getLevelProgress(xp);

  const statusLabel = GAMIFICATION_STATUS_LABELS[status] || 'Потребитель';

  return {
    gamification,
    xp,
    level,
    status,
    statusLabel,
    progress,
    fetchGamification,
    addXp,
  };
};
