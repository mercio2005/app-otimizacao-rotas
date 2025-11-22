// Integração com RapidAPI Route Planner para otimização de rotas

interface RapidAPIRouteResponse {
  routes: Array<{
    duration: number;
    distance: number;
    geometry: string;
  }>;
}

interface RouteResult {
  duration: number;
  distance: number;
  encodedPath: string;
}

export async function getRouteFromRapidAPI(
  startLat: number,
  startLon: number,
  destLat: number,
  destLon: number
): Promise<RouteResult | null> {
  const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;

  if (!apiKey) {
    console.warn('⚠️ RAPIDAPI_KEY não configurada');
    return null;
  }

  try {
    const response = await fetch(
      `https://route-planner2.p.rapidapi.com/routing?waypoints=${startLat},${startLon}|${destLat},${destLon}&mode=drive`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'route-planner2.p.rapidapi.com'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`RapidAPI error: ${response.status}`);
    }

    const data: RapidAPIRouteResponse = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        duration: route.duration,
        distance: route.distance,
        encodedPath: route.geometry
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao obter rota do RapidAPI:', error);
    return null;
  }
}

export function openGoogleMapsRoute(
  startAddress: string,
  destAddress: string
): void {
  // Codifica os endereços para URL
  const encodedStart = encodeURIComponent(startAddress);
  const encodedDest = encodeURIComponent(destAddress);
  
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodedStart}&destination=${encodedDest}&travelmode=driving`;
  
  if (typeof window !== 'undefined') {
    window.open(gmapsUrl, '_blank');
  }
}
