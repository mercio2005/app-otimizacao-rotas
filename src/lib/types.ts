// Tipos para o sistema de otimização de rotas

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  id: string;
  address: string;
  coordinates?: Coordinates;
  type: 'start' | 'delivery' | 'pickup';
}

export interface RouteStop extends Address {
  order: number;
  completed: boolean;
}

export interface OptimizedRoute {
  stops: RouteStop[];
  totalDistance: number;
  createdAt: Date;
}

export interface GeocodingResult {
  address: string;
  coordinates: Coordinates;
  formattedAddress: string;
}
