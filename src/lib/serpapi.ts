// Integração com SerpAPI para Google Maps
// Equivalente ao código Ruby fornecido

export interface SerpApiConfig {
  apiKey: string;
  engine?: string;
}

export interface GoogleMapsSearchParams {
  q: string; // Query de busca (ex: "Coffee", "Restaurant", endereço)
  ll?: string; // Coordenadas no formato "@lat,lng,zoom" (ex: "@40.7455096,-74.0083012,14z")
  type?: string; // Tipo de busca (ex: "search", "directions")
}

export interface SerpApiResult {
  search_metadata?: any;
  search_parameters?: any;
  search_information?: any;
  local_results?: Array<{
    position: number;
    title: string;
    place_id: string;
    data_id: string;
    data_cid: string;
    reviews_link: string;
    photos_link: string;
    gps_coordinates: {
      latitude: number;
      longitude: number;
    };
    place_id_search: string;
    provider_id: string;
    rating: number;
    reviews: number;
    type: string;
    types: string[];
    type_id: string;
    address: string;
    open_state: string;
    hours: string;
    phone: string;
    website: string;
    description: string;
    service_options?: any;
  }>;
  directions?: Array<{
    distance: string;
    duration: string;
    steps: Array<{
      instruction: string;
      distance: string;
      duration: string;
    }>;
  }>;
}

/**
 * Cliente SerpAPI para buscar informações do Google Maps
 */
export class SerpApiClient {
  private apiKey: string;
  private engine: string;
  private baseUrl = 'https://serpapi.com/search';

  constructor(config: SerpApiConfig) {
    this.apiKey = config.apiKey;
    this.engine = config.engine || 'google_maps';
  }

  /**
   * Realiza busca no Google Maps via SerpAPI
   * @param params Parâmetros de busca
   * @returns Resultados da busca
   */
  async search(params: GoogleMapsSearchParams): Promise<SerpApiResult | null> {
    try {
      const queryParams = new URLSearchParams({
        engine: this.engine,
        api_key: this.apiKey,
        q: params.q,
        ...(params.ll && { ll: params.ll }),
        ...(params.type && { type: params.type })
      });

      const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`SerpAPI error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar no SerpAPI:', error);
      return null;
    }
  }

  /**
   * Busca estabelecimentos próximos a uma coordenada
   * @param query Tipo de estabelecimento (ex: "Coffee", "Restaurant")
   * @param lat Latitude
   * @param lng Longitude
   * @param zoom Zoom do mapa (padrão: 14z)
   * @returns Resultados da busca
   */
  async searchNearby(
    query: string,
    lat: number,
    lng: number,
    zoom: string = '14z'
  ): Promise<SerpApiResult | null> {
    const ll = `@${lat},${lng},${zoom}`;
    return this.search({ q: query, ll });
  }

  /**
   * Busca direções entre dois pontos
   * @param origin Endereço de origem
   * @param destination Endereço de destino
   * @returns Direções e informações de rota
   */
  async getDirections(origin: string, destination: string): Promise<SerpApiResult | null> {
    const query = `${origin} to ${destination}`;
    return this.search({ q: query, type: 'directions' });
  }
}

/**
 * Cria instância do cliente SerpAPI
 * @returns Cliente configurado ou null se API key não estiver disponível
 */
export function createSerpApiClient(): SerpApiClient | null {
  const apiKey = process.env.NEXT_PUBLIC_SERPAPI_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ SERPAPI_KEY não configurada. Funcionalidades de busca avançada desabilitadas.');
    return null;
  }

  return new SerpApiClient({
    apiKey,
    engine: 'google_maps'
  });
}

/**
 * Busca informações sobre um endereço usando SerpAPI
 * @param address Endereço para buscar
 * @param lat Latitude (opcional)
 * @param lng Longitude (opcional)
 * @returns Informações do local
 */
export async function searchAddressInfo(
  address: string,
  lat?: number,
  lng?: number
): Promise<SerpApiResult | null> {
  const client = createSerpApiClient();
  
  if (!client) {
    return null;
  }

  if (lat && lng) {
    return client.searchNearby(address, lat, lng);
  }

  return client.search({ q: address });
}

/**
 * Otimiza rota usando SerpAPI para obter informações de tráfego e distâncias reais
 * @param origin Endereço de origem
 * @param destinations Lista de destinos
 * @returns Informações de rota otimizada
 */
export async function optimizeRouteWithSerpApi(
  origin: string,
  destinations: Array<{ address: string; lat: number; lng: number }>
): Promise<Array<{ address: string; distance?: string; duration?: string }> | null> {
  const client = createSerpApiClient();
  
  if (!client) {
    return null;
  }

  try {
    const routeInfo = await Promise.all(
      destinations.map(async (dest) => {
        const directions = await client.getDirections(origin, dest.address);
        
        if (directions && directions.directions && directions.directions.length > 0) {
          return {
            address: dest.address,
            distance: directions.directions[0].distance,
            duration: directions.directions[0].duration
          };
        }
        
        return {
          address: dest.address
        };
      })
    );

    return routeInfo;
  } catch (error) {
    console.error('Erro ao otimizar rota com SerpAPI:', error);
    return null;
  }
}
