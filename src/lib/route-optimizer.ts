// Algoritmo de otimização de rotas usando Nearest Neighbor + SerpAPI + RapidAPI

import { Address, RouteStop, OptimizedRoute, Coordinates } from './types';
import { calculateDistance } from './geocoding';
import { optimizeRouteWithSerpApi } from './serpapi';
import { getRouteFromRapidAPI } from './rapidapi-route';

export async function optimizeRoute(
  startAddress: Address,
  deliveries: Address[],
  pickups: Address[]
): Promise<OptimizedRoute> {
  // Validar que todos os endereços têm coordenadas
  const allAddresses = [startAddress, ...deliveries, ...pickups];
  const validAddresses = allAddresses.filter(addr => addr.coordinates);
  
  if (validAddresses.length === 0) {
    return {
      stops: [],
      totalDistance: 0,
      createdAt: new Date()
    };
  }

  // Tentar usar SerpAPI para otimização avançada
  const destinations = [...deliveries, ...pickups].filter(addr => addr.coordinates);
  
  try {
    const serpApiResults = await optimizeRouteWithSerpApi(
      startAddress.address,
      destinations.map(d => ({
        address: d.address,
        lat: d.coordinates!.lat,
        lng: d.coordinates!.lng
      }))
    );

    // Se SerpAPI retornou resultados, usar informações de distância/duração reais
    if (serpApiResults && serpApiResults.length > 0) {
      console.log('✅ Rota otimizada com SerpAPI (distâncias e durações reais do Google Maps)');
      
      // Ordenar por duração estimada
      const sortedResults = serpApiResults
        .map((result, index) => ({
          ...destinations[index],
          distance: result.distance,
          duration: result.duration
        }))
        .sort((a, b) => {
          // Extrair números da duração (ex: "15 min" -> 15)
          const getDuration = (dur?: string) => {
            if (!dur) return Infinity;
            const match = dur.match(/(\d+)/);
            return match ? parseInt(match[1]) : Infinity;
          };
          return getDuration(a.duration) - getDuration(b.duration);
        });

      const route: RouteStop[] = [];
      let order = 1;

      // Adicionar ponto de partida
      route.push({
        ...startAddress,
        order: 0,
        completed: false
      });

      // Adicionar destinos ordenados
      sortedResults.forEach(dest => {
        route.push({
          ...dest,
          order,
          completed: false
        });
        order++;
      });

      // Calcular distância total aproximada
      let totalDistance = 0;
      for (let i = 0; i < route.length - 1; i++) {
        if (route[i].coordinates && route[i + 1].coordinates) {
          totalDistance += calculateDistance(route[i].coordinates!, route[i + 1].coordinates!);
        }
      }

      return {
        stops: route,
        totalDistance: Math.round(totalDistance * 100) / 100,
        createdAt: new Date()
      };
    }
  } catch (error) {
    console.warn('⚠️ SerpAPI não disponível, usando algoritmo local (Nearest Neighbor)');
  }

  // Fallback: Algoritmo Nearest Neighbor (vizinho mais próximo)
  const unvisited = [...deliveries, ...pickups].filter(addr => addr.coordinates);
  const route: RouteStop[] = [];
  let currentPosition = startAddress.coordinates!;
  let totalDistance = 0;
  let order = 1;

  // Adicionar ponto de partida
  route.push({
    ...startAddress,
    order: 0,
    completed: false
  });

  // Encontrar o próximo endereço mais próximo iterativamente
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    // Encontrar o endereço não visitado mais próximo
    unvisited.forEach((address, index) => {
      if (address.coordinates) {
        const distance = calculateDistance(currentPosition, address.coordinates);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      }
    });

    // Adicionar o endereço mais próximo à rota
    const nearest = unvisited[nearestIndex];
    route.push({
      ...nearest,
      order,
      completed: false
    });

    totalDistance += nearestDistance;
    currentPosition = nearest.coordinates!;
    unvisited.splice(nearestIndex, 1);
    order++;
  }

  return {
    stops: route,
    totalDistance: Math.round(totalDistance * 100) / 100,
    createdAt: new Date()
  };
}

export async function getDetailedRoute(
  startLat: number,
  startLon: number,
  destLat: number,
  destLon: number
): Promise<{ duration: number; distance: number; encodedPath: string } | null> {
  return await getRouteFromRapidAPI(startLat, startLon, destLat, destLon);
}

export function saveRouteToStorage(route: OptimizedRoute): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('optimizedRoute', JSON.stringify(route));
  }
}

export function loadRouteFromStorage(): OptimizedRoute | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('optimizedRoute');
    if (stored) {
      const route = JSON.parse(stored);
      route.createdAt = new Date(route.createdAt);
      return route;
    }
  }
  return null;
}

export function updateStopStatus(stopId: string, completed: boolean): void {
  const route = loadRouteFromStorage();
  if (route) {
    const stop = route.stops.find(s => s.id === stopId);
    if (stop) {
      stop.completed = completed;
      saveRouteToStorage(route);
    }
  }
}
