'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'expired' | null>(null);

  useEffect(() => {
    // Verificar sessão inicial
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await checkSubscription(session.user.id);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await checkSubscription(session.user.id);
      } else {
        setUser(null);
        setSubscriptionStatus(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_status, subscription_expires_at')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const now = new Date();
      const expiresAt = new Date(data.subscription_expires_at);

      if (expiresAt < now) {
        setSubscriptionStatus('expired');
        
        // Atualizar status no banco
        await supabase
          .from('users')
          .update({ subscription_status: 'expired' })
          .eq('id', userId);

        router.push('/renew-subscription');
      } else {
        setSubscriptionStatus('active');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('keepLoggedIn');
    router.push('/');
  };

  return {
    user,
    loading,
    subscriptionStatus,
    logout,
  };
}
