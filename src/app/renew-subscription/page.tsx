'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Check, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type SubscriptionPlan = 'monthly' | 'semester' | 'annual';

export default function RenewSubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUserId(session.user.id);
      }
    };
    checkSession();
  }, [router]);

  const plans = [
    {
      id: 'monthly' as SubscriptionPlan,
      name: 'Mensal',
      price: 9.90,
      duration: 30,
      description: 'Renovação mensal',
      popular: false,
    },
    {
      id: 'semester' as SubscriptionPlan,
      name: 'Semestral',
      price: 53.40,
      duration: 180,
      description: 'Economize 10%',
      popular: true,
    },
    {
      id: 'annual' as SubscriptionPlan,
      name: 'Anual',
      price: 82.80,
      duration: 365,
      description: 'Melhor custo-benefício',
      popular: false,
    },
  ];

  const calculateExpirationDate = (days: number) => {
    const now = new Date();
    now.setDate(now.getDate() + days);
    return now.toISOString();
  };

  const handleRenew = async (plan: SubscriptionPlan) => {
    if (!userId) return;

    setLoading(true);
    setError('');

    try {
      const selectedPlan = plans.find(p => p.id === plan);
      if (!selectedPlan) throw new Error('Plano não encontrado');

      const endDate = calculateExpirationDate(selectedPlan.duration);

      // Update subscription in database
      const { error: updateError } = await supabase
        .from('users')
        .update({
          subscription_plan: plan,
          subscription_status: 'active',
          subscription_expires_at: endDate,
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Redirect to routes
      router.push('/routes');
    } catch (err: any) {
      setError(err.message || 'Erro ao renovar assinatura. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Alert */}
        <div className="glass-effect rounded-3xl shadow-2xl p-6 border border-red-500/50 backdrop-blur-xl mb-8 flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Assinatura Expirada</h2>
            <p className="text-slate-300">
              Sua assinatura expirou. Renove agora para continuar usando o Lunax Pro e otimizar suas entregas.
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-3">
            Renovar Assinatura
          </h1>
          <p className="text-slate-400 text-lg">
            Escolha o plano ideal para continuar
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`glass-effect rounded-3xl shadow-2xl p-6 border backdrop-blur-xl transition-all duration-300 hover:scale-105 cursor-pointer relative ${
                plan.popular
                  ? 'border-emerald-500/50 ring-2 ring-emerald-500/20'
                  : 'border-slate-700/50 hover:border-emerald-500/30'
              }`}
              onClick={() => !loading && handleRenew(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    POPULAR
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    ${plan.price.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm">{plan.duration} dias de acesso</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm">Rotas ilimitadas</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm">Suporte prioritário</span>
                  </div>
                </div>

                <button
                  disabled={loading}
                  className={`w-full px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-white hover:from-emerald-600 hover:to-cyan-700 shadow-lg hover:shadow-emerald-500/50'
                      : 'bg-slate-700/50 text-white hover:bg-slate-600/50'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Processando...' : 'Renovar Agora'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}