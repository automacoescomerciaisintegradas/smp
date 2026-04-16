'use client';

import { useState } from 'react';
import { Gift, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface RewardCardProps {
  reward: {
    id: string;
    name: string;
    description?: string;
    pointsCost: number;
    type: string;
    value?: number;
    stock?: number;
    redeemed: number;
  };
  userPoints: number;
  onRedeem?: (rewardId: string) => void;
}

export default function RewardCard({ reward, userPoints, onRedeem }: RewardCardProps) {
  const [isRedeeming, setIsRedeeming] = useState(false);

  const canRedeem = userPoints >= reward.pointsCost;
  const isAvailable = reward.stock == null || reward.redeemed < reward.stock;

  const handleRedeem = async () => {
    if (!canRedeem || !isAvailable) return;

    setIsRedeeming(true);
    try {
      const response = await fetch('/api/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewardId: reward.id
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao resgatar recompensa');
      }

      toast.success('Recompensa resgatada com sucesso!');
      onRedeem?.(reward.id);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao resgatar recompensa');
    } finally {
      setIsRedeeming(false);
    }
  };

  const typeLabels: any = {
    discount: 'Desconto',
    product: 'Produto',
    experience: 'Experiência',
    cashback: 'Cashback'
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-purple-300 transition-all hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="bg-purple-100 p-3 rounded-lg">
          <Gift size={24} className="text-purple-600" />
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100">
          {typeLabels[reward.type] || reward.type}
        </span>
      </div>

      <h3 className="text-xl font-bold mb-2">{reward.name}</h3>
      {reward.description && (
        <p className="text-gray-600 text-sm mb-4">{reward.description}</p>
      )}

      {reward.value && (
        <div className="text-2xl font-bold text-green-600 mb-4">
          R$ {reward.value.toFixed(2)}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          {reward.stock != null && (
            <span>Restam {reward.stock - reward.redeemed} unidades</span>
          )}
        </div>
      </div>

      <div className="bg-purple-50 rounded-lg p-3 mb-4">
        <div className="text-sm text-purple-600 font-semibold">
          {reward.pointsCost} pontos necessários
        </div>
      </div>

      <button
        onClick={handleRedeem}
        disabled={!canRedeem || !isAvailable || isRedeeming}
        className="w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
          disabled:opacity-50 disabled:cursor-not-allowed
          bg-purple-600 hover:bg-purple-700 text-white"
      >
        {isRedeeming ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Resgatando...
          </>
        ) : canRedeem && isAvailable ? (
          <>
            <Check size={20} />
            Resgatar Agora
          </>
        ) : (
          'Pontos insuficientes'
        )}
      </button>
    </div>
  );
}
