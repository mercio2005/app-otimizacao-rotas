// Integração com Google Maps Geocoding API

import { Coordinates, GeocodingResult } from './types';

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    // Modo desenvolvimento: retorna coordenadas simuladas SEM erro no console
    return {
      address,
      coordinates: {
        lat: -23.5505 + Math.random() * 0.1,
        lng: -46.6333 + Math.random() * 0.1
      },
      formattedAddress: address
    };
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return {
        address,
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        },
        formattedAddress: result.formatted_address
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
    return null;
  }
}

export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  // Fórmula de Haversine para calcular distância entre coordenadas
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function openInGPS(address: string, appType: 'google' | 'waze' = 'google') {
  const encodedAddress = encodeURIComponent(address);
  const url = `/navigation?address=${encodedAddress}&gps=${appType}`;
  
  try {
    // Tenta abrir a página de navegação em nova aba
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    // Verifica se conseguiu abrir
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Fallback: cria um link temporário e simula clique
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Adiciona ao DOM temporariamente
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Alerta ao usuário caso ainda não funcione
      setTimeout(() => {
        alert(
          '⚠️ Se a navegação não abriu, verifique se seu navegador está bloqueando pop-ups.\n\n' +
          'Permita pop-ups para este site nas configurações do navegador.'
        );
      }, 500);
    }
  } catch (error) {
    console.error('Erro ao abrir navegação:', error);
    
    // Fallback final: cria link e simula clique
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Alerta ao usuário
    alert(
      '⚠️ Houve um problema ao abrir a navegação.\n\n' +
      'Tente permitir pop-ups para este site ou clique com o botão direito no botão "Partida" e selecione "Abrir em nova aba".'
    );
  }
}
