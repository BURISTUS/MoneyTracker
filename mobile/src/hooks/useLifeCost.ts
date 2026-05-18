import { useDataStore } from '../stores/dataStore';
import i18n from '../i18n';

export const useLifeCost = () => {
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);
  const calculateLifeCost = useDataStore((s) => s.calculateLifeCost);

  const hourlyRate = getHourlyRate();

  const calculate = async (amount: number) => {
    return calculateLifeCost(amount);
  };

  const formatLifeCost = async (amount: number): Promise<string> => {
    const { hours, days } = await calculate(amount);
    if (days >= 1) return `${Math.round(days * 10) / 10} ${i18n.t('components.daysShort')}`;
    if (hours >= 1) return `${Math.round(hours * 10) / 10} ч.`;
    return `${Math.round(hours * 60)} ${i18n.t('common.min')}`;
  };

  return {
    hourlyRate,
    calculate,
    formatLifeCost,
  };
};
