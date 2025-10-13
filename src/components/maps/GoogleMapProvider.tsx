'use client';

import React, { useEffect, useState } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

const libraries: ('drawing' | 'geometry' | 'places')[] = ['drawing'];

interface GoogleMapProviderProps {
  children: React.ReactNode;
}

export function GoogleMapProvider({ children }: GoogleMapProviderProps) {
  const [mounted, setMounted] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  
  // ALWAYS call hooks unconditionally - this is a React rule
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: libraries,
    preventGoogleFontsLoading: true,
  });
  
  useEffect(() => {
    setMounted(true);
    console.log('GoogleMapProvider - API Key configured:', !!apiKey);
    console.log('GoogleMapProvider - API Key length:', apiKey?.length || 0);
  }, [apiKey]);
  
  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Inicializando...</p>
        </div>
      </div>
    );
  }
  
  // Check for API key after hooks have been called
  if (!apiKey) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Google Maps API Key no configurada
          </div>
          <p className="text-gray-600">
            Por favor configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en tu archivo .env.local
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    console.error('GoogleMapProvider - Error loading maps:', loadError);
    return (
      <div className="flex items-center justify-center p-8 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar Google Maps
          </div>
          <p className="text-gray-600 mb-2">
            Error: {loadError.message || 'Error desconocido al cargar Google Maps'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando Google Maps...</p>
        </div>
      </div>
    );
  }

  console.log('GoogleMapProvider - Maps loaded successfully');
  return <>{children}</>;
}
