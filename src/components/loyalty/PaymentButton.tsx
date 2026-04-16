'use client';

import { useState } from 'react';
import { CreditCard, QrCode, Barcode, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentButtonProps {
  enrollmentId: string;
  amount: number;
  className?: string;
  onSuccess?: (payment: any) => void;
}

export default function PaymentButton({ enrollmentId, amount, className, onSuccess }: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix');
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId,
          method: selectedMethod,
          gateway: 'mercadopago',
          installments: selectedMethod === 'credit_card' ? 1 : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar pagamento');
      }

      const data = await response.json();
      setPaymentResult(data);
      toast.success('Pagamento criado com sucesso!');
      onSuccess?.(data);
    } catch (error) {
      toast.error('Erro ao processar pagamento');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors ${className}`}
      >
        <CreditCard size={20} />
        Pagar Agora
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Escolha a forma de pagamento</h2>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setSelectedMethod('pix')}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  selectedMethod === 'pix' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <QrCode size={24} className="text-green-600" />
                <div className="text-left">
                  <div className="font-semibold">PIX</div>
                  <div className="text-sm text-gray-600">Pagamento instantâneo</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedMethod('credit_card')}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  selectedMethod === 'credit_card' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard size={24} className="text-green-600" />
                <div className="text-left">
                  <div className="font-semibold">Cartão de Crédito</div>
                  <div className="text-sm text-gray-600">Até 12x sem juros</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedMethod('boleto')}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  selectedMethod === 'boleto' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Barcode size={24} className="text-green-600" />
                <div className="text-left">
                  <div className="font-semibold">Boleto Bancário</div>
                  <div className="text-sm text-gray-600">Vencimento em 3 dias</div>
                </div>
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="text-sm text-gray-600">Valor total:</div>
              <div className="text-3xl font-bold text-green-600">
                R$ {amount.toFixed(2)}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Confirmar Pagamento'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
