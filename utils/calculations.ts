
import { RiskLevel } from '../types';

export const calculateSafeBunks = (attended: number, total: number, requiredPct: number) => {
  if (total === 0) return { safeBunks: 0, currentPct: 0, needed: 0, risk: RiskLevel.SAFE };
  
  const currentPct = (attended / total) * 100;
  const requiredAttended = Math.ceil(total * (requiredPct / 100));
  const safeBunks = attended - requiredAttended;
  const needed = safeBunks < 0 ? requiredAttended - attended : 0;

  let risk = RiskLevel.SAFE;
  if (safeBunks < -2) risk = RiskLevel.DANGER;
  else if (safeBunks < 0) risk = RiskLevel.BORDERLINE;

  return { safeBunks, currentPct, needed, risk };
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const getDaysRemaining = (endDate: string) => {
  const diff = new Date(endDate).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
