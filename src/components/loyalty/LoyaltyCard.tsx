'use client';

import { Award, Gift, TrendingUp, Clock } from 'lucide-react';

interface LoyaltyCardProps {
  totalPoints: number;
  availableRewards: number;
  className?: string;
}

export default function LoyaltyCard({ totalPoints, availableRewards, className }: LoyaltyCardProps) {
  return (
    <div className={`bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white ${className}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-purple-200 text-sm mb-1">Seus Pontos</p>
          <h3 className="text-4xl font-bold">{totalPoints}</h3>
          <p className="text-purple-200 text-xs mt-1">pontos disponíveis</p>
        </div>
        <Award size={48} className="text-purple-300" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/10 rounded-lg p-3">
          <Gift size={20} className="mb-2" />
          <div className="text-2xl font-bold">{availableRewards}</div>
          <div className="text-xs text-purple-200">Recompensas</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <TrendingUp size={20} className="mb-2" />
          <div className="text-2xl font-bold">+150</div>
          <div className="text-xs text-purple-200">Este mês</div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-purple-200">
        <Clock size={16} />
        <span>Pontos expiram em 12 meses</span>
      </div>
    </div>
  );
}
