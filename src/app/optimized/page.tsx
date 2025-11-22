'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Navigation, CheckCircle, Package, Truck, ArrowLeft, CheckCheck, Sparkles, ExternalLink } from 'lucide-react';
import { OptimizedRoute } from '@/lib/types';
import { loadRouteFromStorage, saveRouteToStorage } from '@/lib/route-optimizer';

export default function OptimizedRoutePage() {
  const router = useRouter();
  const [route, setRoute] = useState<OptimizedRoute | null>(null);
  const [gpsApp, setGpsApp] = useState<'google' | 'waze'>('google');
  const [allCompleted, setAllCompleted] = useState(false);

  useEffect(() => {
    const loadedRoute = loadRouteFromStorage();
    if (loadedRoute) {
      setRoute(loadedRoute);
    } else {
      router.push('/routes');
    }
  }, [router]);

  const handleNavigate = (stopId: string) => {
    // Botão de navegação desabilitado provisoriamente
    return;
  };

  const handleComplete = (stopId: string) => {
    if (!route || allCompleted) return;
    
    const updatedStops = route.stops.map(stop => 
      stop.id === stopId ? { ...stop, completed: true } : stop
    );
    
    const updatedRoute = { ...route, stops: updatedStops };
    setRoute(updatedRoute);
    saveRouteToStorage(updatedRoute);
  };

  const handleCompleteAll = () => {
    if (!route) return;
    
    const updatedStops = route.stops.map(stop => ({ ...stop, completed: true }));
    const updatedRoute = { ...route, stops: updatedStops };
    
    setRoute(updatedRoute);
    saveRouteToStorage(updatedRoute);
    setAllCompleted(true);
  };

  if (!route) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Carregando rota...</p>
        </div>
      </div>
    );
  }

  const completedStops = route.stops.filter(s => s.completed).length;
  const totalStops = route.stops.length;
  const progress = totalStops > 0 ? (completedStops / totalStops) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <button
            onClick={() => router.push('/routes')}
            className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 mb-6 transition-all duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-semibold">Voltar para Planejamento</span>
          </button>
          
          <div className="glass-effect rounded-2xl shadow-2xl p-6 border border-slate-700/50 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    Rota Otimizada
                  </h1>
                  <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
                <p className="text-slate-300 text-lg">
                  Distância total estimada: <span className="font-semibold text-emerald-400">{route.totalDistance} km</span>
                </p>
              </div>
              <Navigation className="w-14 h-14 text-emerald-400 drop-shadow-2xl" />
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-300">Progresso da Rota</span>
                <span className="text-sm font-semibold text-emerald-400">{completedStops}/{totalStops} paradas</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-cyan-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* GPS App Info */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-700">
              <span className="text-sm font-semibold text-slate-300">Navegação:</span>
              <div className="flex items-center gap-2 text-slate-500">
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm font-semibold">Desabilitado provisoriamente</span>
              </div>
            </div>
          </div>
        </div>

        {/* Route Stops */}
        <div className="space-y-4">
          {route.stops.map((stop, index) => {
            const isStart = stop.type === 'start';
            const isDelivery = stop.type === 'delivery';
            const isPickup = stop.type === 'pickup';
            
            let bgColor = 'bg-slate-800/50 border-slate-700/50';
            let iconColor = 'text-emerald-400';
            let Icon = MapPin;
            
            if (isDelivery) {
              bgColor = 'bg-slate-800/50 border-slate-700/50';
              iconColor = 'text-orange-400';
              Icon = Package;
            } else if (isPickup) {
              bgColor = 'bg-slate-800/50 border-slate-700/50';
              iconColor = 'text-purple-400';
              Icon = Truck;
            }

            if (stop.completed) {
              bgColor = 'bg-emerald-900/30 border-emerald-500/50';
              iconColor = 'text-emerald-400';
            }

            return (
              <div
                key={stop.id}
                className={`glass-effect rounded-2xl shadow-2xl p-6 border-2 ${bgColor} transition-all duration-300 backdrop-blur-xl animate-fadeIn ${
                  stop.completed ? 'opacity-75' : 'hover:scale-[1.02] transform'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Order Number */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${stop.completed ? 'bg-emerald-900/50' : 'bg-slate-700/50'} flex items-center justify-center font-bold text-lg ${iconColor} border-2 ${stop.completed ? 'border-emerald-500/50' : 'border-slate-600'}`}>
                    {stop.completed ? <CheckCircle className="w-6 h-6" /> : stop.order}
                  </div>

                  {/* Stop Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                      <h3 className="font-bold text-slate-100 text-lg">
                        {isStart && 'Ponto de Partida'}
                        {isDelivery && `Entrega #${stop.order}`}
                        {isPickup && `Coleta #${stop.order}`}
                      </h3>
                      {stop.completed && (
                        <span className="px-3 py-1 bg-emerald-900/50 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/50">
                          Concluído
                        </span>
                      )}
                    </div>
                    
                    <p className="text-slate-300 mb-2">{stop.address}</p>
                    
                    {stop.coordinates && (
                      <p className="text-xs text-slate-500">
                        📍 {stop.coordinates.lat.toFixed(6)}, {stop.coordinates.lng.toFixed(6)}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {!isStart && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleNavigate(stop.id)}
                        disabled={true}
                        className="px-6 py-2 bg-slate-600 text-slate-400 font-semibold rounded-xl transition-all duration-300 opacity-50 cursor-not-allowed shadow-lg flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Navegar
                      </button>
                      
                      <button
                        onClick={() => handleComplete(stop.id)}
                        disabled={stop.completed || allCompleted}
                        className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/50 hover:scale-105 transform"
                      >
                        Concluído
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Complete All Route Button */}
        {!allCompleted && (
          <div className="mt-8 animate-fadeIn">
            <button
              onClick={handleCompleteAll}
              className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-700 text-white text-lg font-bold rounded-2xl hover:from-emerald-700 hover:to-cyan-800 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/50 flex items-center justify-center gap-3 hover:scale-105 transform btn-primary"
            >
              <CheckCheck className="w-6 h-6" />
              Concluir Toda a Rota
            </button>
          </div>
        )}

        {/* Summary */}
        {(completedStops === totalStops || allCompleted) && totalStops > 0 && (
          <div className="mt-8 bg-gradient-to-r from-emerald-600 to-cyan-700 rounded-2xl shadow-2xl p-8 text-white text-center border border-emerald-500/50 animate-scaleIn">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Rota Concluída! 🎉</h2>
            <p className="text-lg opacity-90">
              Todas as {totalStops} paradas foram completadas com sucesso.
            </p>
            <button
              onClick={() => router.push('/routes')}
              className="mt-6 px-8 py-3 bg-white text-emerald-600 font-bold rounded-xl hover:bg-slate-100 transition-all duration-300 shadow-lg hover:scale-105 transform"
            >
              Planejar Nova Rota
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
