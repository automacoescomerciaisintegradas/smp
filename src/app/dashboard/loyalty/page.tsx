'use client';

import { useState, useEffect } from 'react';
import { Loader2, Star, Gift, Share2, Users } from 'lucide-react';
import LoyaltyCard from '@/components/loyalty/LoyaltyCard';
import RewardCard from '@/components/loyalty/RewardCard';
import toast from 'react-hot-toast';

export default function LoyaltyPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    totalPoints: 0,
    rewards: [],
    redemptions: [],
    pointsHistory: []
  });

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      const response = await fetch('/api/loyalty');
      if (response.ok) {
        const data = await response.json();
        setData(data);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados de fidelidade');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = (rewardId: string) => {
    fetchLoyaltyData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={48} className="animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Programa de Fidelidade</h1>
        <p className="text-gray-600">Gerencie recompensas e incentive a divulgação da sua marca</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <LoyaltyCard
            totalPoints={data.totalPoints}
            availableRewards={data.rewards.length}
          />
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <Star size={24} className="text-green-600" />
            </div>
            <div className="text-3xl font-bold mb-1">{data.totalPoints}</div>
            <div className="text-sm text-gray-600">Pontos Totais</div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <Gift size={24} className="text-purple-600" />
            </div>
            <div className="text-3xl font-bold mb-1">{data.redemptions.length}</div>
            <div className="text-sm text-gray-600">Recompensas Resgatadas</div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
              <Share2 size={24} className="text-blue-600" />
            </div>
            <div className="text-3xl font-bold mb-1">+150</div>
            <div className="text-sm text-gray-600">Indicações este mês</div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Como Ganhar Pontos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <Users size={32} className="mb-3" />
            <h3 className="text-lg font-bold mb-2">Inscrições</h3>
            <p className="text-sm text-green-100">Ganhe 100 pontos por cada inscrição realizada</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <Share2 size={32} className="mb-3" />
            <h3 className="text-lg font-bold mb-2">Redes Sociais</h3>
            <p className="text-sm text-blue-100">50 pontos por cada postagem sobre a marca</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <Gift size={32} className="mb-3" />
            <h3 className="text-lg font-bold mb-2">Indicações</h3>
            <p className="text-sm text-purple-100">200 pontos por amigo que se inscrever</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <Star size={32} className="mb-3" />
            <h3 className="text-lg font-bold mb-2">Bônus</h3>
            <p className="text-sm text-orange-100">Pontos bônus por participação em eventos</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Recompensas Disponíveis</h2>
        {data.rewards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.rewards.map((reward: any) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                userPoints={data.totalPoints}
                onRedeem={handleRedeem}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
            <Gift size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma recompensa disponível</h3>
            <p className="text-gray-600">Recompensas serão adicionadas em breve</p>
          </div>
        )}
      </div>
    </div>
  );
}
