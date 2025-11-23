'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Package, Truck, Navigation, Plus, Trash2, Sparkles, LogOut, AlertCircle } from 'lucide-react';
import { Address } from '@/lib/types';
import { geocodeAddress } from '@/lib/geocoding';
import { optimizeRoute, saveRouteToStorage } from '@/lib/route-optimizer';
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionChecker } from '@/components/SubscriptionChecker';

export default function RoutesPage() {
  const router = useRouter();
  const { user, loading: authLoading, subscriptionStatus, logout } = useAuth();
  
  const [startAddress, setStartAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  
  const [startPoint, setStartPoint] = useState<Address | null>(null);
  const [deliveries, setDeliveries] = useState<Address[]>([]);
  const [pickups, setPickups] = useState<Address[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState('');

  // Verificar autenticação
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleAddStart = async () => {
    if (!startAddress.trim()) {
      setError('Digite um endereço de partida');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await geocodeAddress(startAddress);
      if (result) {
        const newAddress: Address = {
          id: Date.now().toString(),
          address: result.formattedAddress,
          coordinates: result.coordinates,
          type: 'start'
        };
        setStartPoint(newAddress);
        setStartAddress('');
      } else {
        setError('Não foi possível geocodificar o endereço');
      }
    } catch (err) {
      setError('Erro ao processar endereço');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDelivery = async () => {
    if (!deliveryAddress.trim()) {
      setError('Digite um endereço de entrega');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await geocodeAddress(deliveryAddress);
      if (result) {
        const newAddress: Address = {
          id: Date.now().toString(),
          address: result.formattedAddress,
          coordinates: result.coordinates,
          type: 'delivery'
        };
        setDeliveries([...deliveries, newAddress]);
        setDeliveryAddress('');
      } else {
        setError('Não foi possível geocodificar o endereço');
      }
    } catch (err) {
      setError('Erro ao processar endereço');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPickup = async () => {
    if (!pickupAddress.trim()) {
      setError('Digite um endereço de coleta');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await geocodeAddress(pickupAddress);
      if (result) {
        const newAddress: Address = {
          id: Date.now().toString(),
          address: result.formattedAddress,
          coordinates: result.coordinates,
          type: 'pickup'
        };
        setPickups([...pickups, newAddress]);
        setPickupAddress('');
      } else {
        setError('Não foi possível geocodificar o endereço');
      }
    } catch (err) {
      setError('Erro ao processar endereço');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeRoute = async () => {
    if (!startPoint) {
      setError('Adicione um endereço de partida');
      return;
    }

    if (deliveries.length === 0 && pickups.length === 0) {
      setError('Adicione pelo menos um endereço de entrega ou coleta');
      return;
    }

    setOptimizing(true);
    setError('');

    try {
      const optimized = await optimizeRoute(startPoint, deliveries, pickups);
      saveRouteToStorage(optimized);
      router.push('/optimized');
    } catch (err) {
      setError('Erro ao otimizar rota');
      console.error(err);
    } finally {
      setOptimizing(false);
    }
  };

  const removeDelivery = (id: string) => {
    setDeliveries(deliveries.filter(d => d.id !== id));
  };

  const removePickup = (id: string) => {
    setPickups(pickups.filter(p => p.id !== id));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Subscription Checker - Popup automático quando expirar */}
      <SubscriptionChecker />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Header with Logout */}
        <div className="flex justify-end mb-4">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-600/50 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Navigation className="w-16 h-16 text-emerald-400 drop-shadow-2xl" />
            <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-4xl font-light bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-3 tracking-wide">
            Lunax Pro
          </h1>
          <p className="text-slate-400 text-lg">
            Planeje suas entregas e coletas de forma inteligente
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-300 backdrop-blur-sm animate-scaleIn">
            {error}
          </div>
        )}

        {/* Start Address Section */}
        <div className="glass-effect rounded-2xl shadow-2xl p-6 mb-6 border border-slate-700/50 backdrop-blur-xl animate-scaleIn">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-100">Endereço de Partida</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={startAddress}
              onChange={(e) => setStartAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddStart()}
              placeholder="Digite o endereço de partida..."
              className="flex-1 px-4 py-3 bg-slate-900/50 border-2 border-slate-600 rounded-xl focus:outline-none focus:border-emerald-500 transition-all duration-300 text-slate-100 placeholder-slate-500 hover:border-slate-500"
              disabled={loading || !!startPoint}
            />
            <button
              onClick={handleAddStart}
              disabled={loading || !!startPoint}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/50 hover:scale-105 transform btn-primary"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          </div>

          {startPoint && (
            <div className="mt-4 p-4 bg-emerald-900/30 border border-emerald-500/50 rounded-xl backdrop-blur-sm animate-fadeIn">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-emerald-300">Ponto de Partida Definido</p>
                  <p className="text-sm text-emerald-200 mt-1">{startPoint.address}</p>
                  {startPoint.coordinates && (
                    <p className="text-xs text-emerald-400 mt-1">
                      📍 {startPoint.coordinates.lat.toFixed(6)}, {startPoint.coordinates.lng.toFixed(6)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setStartPoint(null)}
                  className="text-red-400 hover:text-red-300 transition-colors hover:scale-110 transform"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Deliveries and Pickups Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Deliveries Section */}
          <div className="glass-effect rounded-2xl shadow-2xl p-6 border border-slate-700/50 backdrop-blur-xl animate-scaleIn" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-6 h-6 text-orange-400" />
              <h2 className="text-xl font-bold text-slate-100">Entregas (Delivery)</h2>
            </div>
            
            <div className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddDelivery()}
                placeholder="Digite o endereço de entrega..."
                className="px-4 py-3 bg-slate-900/50 border-2 border-slate-600 rounded-xl focus:outline-none focus:border-orange-500 transition-all duration-300 text-slate-100 placeholder-slate-500 hover:border-slate-500"
                disabled={loading}
              />
              <button
                onClick={handleAddDelivery}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/50 hover:scale-105 transform btn-primary"
              >
                <Plus className="w-5 h-5" />
                Adicionar Entrega
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {deliveries.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Nenhuma entrega adicionada</p>
              ) : (
                deliveries.map((delivery, index) => (
                  <div key={delivery.id} className="p-3 bg-orange-900/30 border border-orange-500/50 rounded-lg backdrop-blur-sm animate-fadeIn hover:bg-orange-900/40 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-orange-300 text-sm">Entrega #{index + 1}</p>
                        <p className="text-xs text-orange-200 mt-1">{delivery.address}</p>
                      </div>
                      <button
                        onClick={() => removeDelivery(delivery.id)}
                        className="text-red-400 hover:text-red-300 transition-colors hover:scale-110 transform"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pickups Section */}
          <div className="glass-effect rounded-2xl shadow-2xl p-6 border border-slate-700/50 backdrop-blur-xl animate-scaleIn" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-slate-100">Coletas (Pick Ups)</h2>
            </div>
            
            <div className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddPickup()}
                placeholder="Digite o endereço de coleta..."
                className="px-4 py-3 bg-slate-900/50 border-2 border-slate-600 rounded-xl focus:outline-none focus:border-purple-500 transition-all duration-300 text-slate-100 placeholder-slate-500 hover:border-slate-500"
                disabled={loading}
              />
              <button
                onClick={handleAddPickup}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/50 hover:scale-105 transform btn-primary"
              >
                <Plus className="w-5 h-5" />
                Adicionar Coleta
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pickups.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Nenhuma coleta adicionada</p>
              ) : (
                pickups.map((pickup, index) => (
                  <div key={pickup.id} className="p-3 bg-purple-900/30 border border-purple-500/50 rounded-lg backdrop-blur-sm animate-fadeIn hover:bg-purple-900/40 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-purple-300 text-sm">Coleta #{index + 1}</p>
                        <p className="text-xs text-purple-200 mt-1">{pickup.address}</p>
                      </div>
                      <button
                        onClick={() => removePickup(pickup.id)}
                        className="text-red-400 hover:text-red-300 transition-colors hover:scale-110 transform"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Optimize Button */}
        <div className="text-center animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={handleOptimizeRoute}
            disabled={!startPoint || (deliveries.length === 0 && pickups.length === 0) || optimizing}
            className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-xl font-bold rounded-2xl hover:from-emerald-600 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 transform btn-primary"
          >
            <span className="flex items-center gap-3">
              {optimizing ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Otimizando com SerpAPI...
                </>
              ) : (
                <>
                  <Navigation className="w-6 h-6" />
                  Otimizar Rota
                </>
              )}
            </span>
          </button>
          
          {startPoint && (deliveries.length > 0 || pickups.length > 0) && (
            <p className="text-slate-300 mt-4 text-lg">
              Total de paradas: <span className="font-bold text-emerald-400">{deliveries.length + pickups.length}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
