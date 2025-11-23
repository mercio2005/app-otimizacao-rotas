'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Building2, MapPin, Mail, Phone, Lock, Check, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type SubscriptionPlan = 'monthly' | 'semester' | 'annual';

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    commercialAddress: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.company || !formData.commercialAddress || 
        !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um email válido');
      return false;
    }

    return true;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (validateForm()) {
      setStep('payment');
    }
  };

  const calculateExpirationDate = (days: number) => {
    const now = new Date();
    now.setDate(now.getDate() + days);
    return now.toISOString();
  };

  const handlePaymentSelection = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setLoading(true);
    setError('');

    try {
      const selectedPlanData = plans.find(p => p.id === plan);
      if (!selectedPlanData) throw new Error('Plano não encontrado');

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error('Erro ao criar usuário');

      // Calculate expiration
      const expiresAt = calculateExpirationDate(selectedPlanData.duration);

      // Insert into users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          company: formData.company,
          commercial_address: formData.commercialAddress,
          phone: formData.phone,
          subscription_plan: plan,
          subscription_status: 'active',
          subscription_expires_at: expiresAt,
          keep_logged_in: false,
        });

      if (insertError) throw insertError;

      // Redirect to routes (aba 2)
      router.push('/routes');
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
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

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => step === 'payment' ? setStep('form') : router.push('/')}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-3">
            {step === 'form' ? 'Criar Conta' : 'Escolha seu Plano'}
          </h1>
          <p className="text-slate-400 text-lg">
            {step === 'form' ? 'Preencha seus dados para começar' : 'Selecione o plano ideal para você'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        {step === 'form' ? (
          <form onSubmit={handleFormSubmit} className="glass-effect rounded-3xl shadow-2xl p-8 border border-slate-700/50 backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome Completo */}
              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-2 font-medium">
                  <User className="w-4 h-4 inline mr-2" />
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="João Silva"
                  required
                />
              </div>

              {/* Empresa */}
              <div>
                <label className="block text-slate-300 mb-2 font-medium">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Empresa
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Minha Empresa Ltda"
                  required
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-slate-300 mb-2 font-medium">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Telefone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              {/* Endereço Comercial */}
              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-2 font-medium">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Endereço Comercial
                </label>
                <input
                  type="text"
                  name="commercialAddress"
                  value={formData.commercialAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Rua Exemplo, 123 - São Paulo, SP"
                  required
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-2 font-medium">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              {/* Senha */}
              <div>
                <label className="block text-slate-300 mb-2 font-medium">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Senha
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-slate-300 mb-2 font-medium">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-lg font-bold rounded-2xl hover:from-emerald-600 hover:to-cyan-700 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 transform"
            >
              Continuar para Pagamento
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`glass-effect rounded-3xl shadow-2xl p-6 border backdrop-blur-xl transition-all duration-300 hover:scale-105 cursor-pointer relative ${
                  plan.popular
                    ? 'border-emerald-500/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-700/50 hover:border-emerald-500/30'
                }`}
                onClick={() => !loading && handlePaymentSelection(plan.id)}
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
                    {loading && selectedPlan === plan.id ? 'Processando...' : 'Selecionar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}