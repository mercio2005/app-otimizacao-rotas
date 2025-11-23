'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function SubscriptionChecker() {
  const router = useRouter();
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        // Fetch user data from database
        const { data: userData, error } = await supabase
          .from('users')
          .select('subscription_status, subscription_expires_at')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        const now = new Date();
        const expiresAt = new Date(userData.subscription_expires_at);

        if (expiresAt < now && userData.subscription_status === 'active') {
          // Assinatura expirou
          setShowExpiredModal(true);
        }
      } catch (error) {
        console.error('Erro ao verificar assinatura:', error);
      }
    };

    // Verificar imediatamente
    checkSubscription();

    // Verificar a cada 5 minutos
    const interval = setInterval(checkSubscription, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRenew = () => {
    setShowExpiredModal(false);
    router.push('/renew-subscription');
  };

  if (!showExpiredModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="glass-effect rounded-3xl shadow-2xl p-8 border border-red-500/50 backdrop-blur-xl max-w-md w-full mx-4 relative animate-scaleIn">
        <button
          onClick={() => setShowExpiredModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-start gap-4 mb-6">
          <AlertCircle className="w-12 h-12 text-red-400 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Assinatura Expirada</h2>
            <p className="text-slate-300">
              Sua assinatura do Lunax Pro expirou. Renove agora para continuar otimizando suas entregas.
            </p>
          </div>
        </div>

        <button
          onClick={handleRenew}
          className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-lg font-bold rounded-2xl hover:from-emerald-600 hover:to-cyan-700 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 transform"
        >
          Renovar Assinatura
        </button>
      </div>
    </div>
  );
}