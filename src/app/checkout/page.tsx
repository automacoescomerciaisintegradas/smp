'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import PaymentButton from '@/components/loyalty/PaymentButton';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [classData, setClassData] = useState<any>(null);
  const [blockData, setBlockData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');

  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    promotionCode: ''
  });

  useEffect(() => {
    const classId = searchParams.get('classId');
    const blockId = searchParams.get('blockId');

    if (classId) {
      fetchClassData(classId, blockId ?? undefined);
    }
  }, [searchParams]);

  const fetchClassData = async (classId: string, blockId?: string) => {
    try {
      const response = await fetch(`/api/classes`);
      if (response.ok) {
        const classes = await response.json();
        const foundClass = classes.find((c: any) => c.id === classId);
        if (foundClass) {
          setClassData(foundClass);
          if (blockId) {
            const foundBlock = foundClass.blocks.find((b: any) => b.id === blockId);
            setBlockData(foundBlock);
          }
        }
      }
    } catch (error) {
      toast.error('Erro ao carregar dados da turma');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: classData.id,
          blockId: blockData?.id || null,
          ...formData,
          amount: blockData?.price || classData.price
        })
      });

      if (response.ok) {
        const data = await response.json();
        setEnrollment(data);
        setStep('payment');
        toast.success('Inscrição criada com sucesso!');
      } else {
        toast.error('Erro ao criar inscrição');
      }
    } catch (error) {
      toast.error('Erro ao criar inscrição');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setStep('success');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={48} className="animate-spin text-purple-600" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Turma não encontrada</h1>
          <button
            onClick={() => router.back()}
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = blockData?.price || classData.price;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-700 mb-6"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        {step === 'form' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold mb-2">{classData.name}</h1>
            <p className="text-gray-600 mb-6">{classData.description}</p>

            <div className="bg-purple-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">Investimento:</span>
                <span className="text-3xl font-bold text-purple-600">
                  R$ {totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <div>Início: {new Date(classData.startDate).toLocaleDateString('pt-BR')}</div>
                {blockData && <div>Bloco: {blockData.name}</div>}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Nome Completo *</label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.studentEmail}
                  onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Telefone</label>
                <input
                  type="tel"
                  value={formData.studentPhone}
                  onChange={(e) => setFormData({ ...formData, studentPhone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Código Promocional</label>
                <input
                  type="text"
                  value={formData.promotionCode}
                  onChange={(e) => setFormData({ ...formData, promotionCode: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Ex: PROMO10"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Processando...' : 'Continuar para Pagamento'}
              </button>
            </form>
          </div>
        )}

        {step === 'payment' && enrollment && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-4">Pagamento</h2>
            
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Turma:</span>
                  <span className="font-semibold">{classData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Aluno:</span>
                  <span className="font-semibold">{formData.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span className="text-2xl font-bold text-purple-600">
                    R$ {enrollment.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <PaymentButton
              enrollmentId={enrollment.id}
              amount={enrollment.amount}
              onSuccess={handlePaymentSuccess}
              className="w-full justify-center"
            />
          </div>
        )}

        {step === 'success' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Inscrição Confirmada!</h1>
            <p className="text-gray-600 mb-6">
              Seu pagamento foi processado com sucesso. Você receberá um email com todos os detalhes.
            </p>
            <div className="bg-green-50 rounded-xl p-6 mb-6">
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Turma:</span>
                  <span className="font-semibold">{classData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Início:</span>
                  <span className="font-semibold">
                    {new Date(classData.startDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor pago:</span>
                  <span className="font-bold text-green-600">
                    R$ {enrollment?.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Ir para Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
