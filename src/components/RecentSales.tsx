"use client";

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api/api-client';
import { Button } from './ui/button';
import { useSession } from 'next-auth/react';

interface RideData {
  id: number;
  name: string;
  email: string;
  amount: string;
  type: 'user' | 'driver';
}

interface UserRide {
  rideId: number;
  originAddress: string;
  destinationAddress: string;
  farePrice: string;
  createdAt: string;
  user: { id: number; name: string; email: string };
  driver?: { firstName: string; lastName: string };
  status: string;
}

interface DriverRide {
  rideId: number;
  originAddress: string;
  destinationAddress: string;
  farePrice: number;
  createdAt: string;
  driver: { id: number; firstName: string; lastName: string };
  user?: { name: string; email: string };
  status: string;
}

interface UserResponse {
  id: number;
  name: string;
  email: string;
}

interface DriverResponse {
  id: number;
  firstName: string;
  lastName: string;
}

export default function RecentSales() {
  const { data: session } = useSession();
  const [viewType, setViewType] = useState<'users' | 'drivers'>('users');
  const [recentRides, setRecentRides] = useState<RideData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit] = useState(100);

  useEffect(() => {
    if (!session?.accessToken) {
      setError('No tienes sesión activa');
      setLoading(false);
      return;
    }

    const fetchRecentRides = async () => {
      setLoading(true);
      setError(null);

      try {
        let rides: RideData[] = [];
        const headers = { Authorization: `Bearer ${session.accessToken}` };

        if (viewType === 'users') {
          const usersResponse = await api.get<UserResponse[]>(`admin/users?limit=${limit}`, { headers });
          const users = usersResponse.data || [];

          const userRidesPromises = users.map(async (user) => {
            try {
              const userRidesResponse = await api.get<UserRide[]>(`/api/ride/${user.id}`, { headers });
              return (userRidesResponse.data || []).map(ride => ({
                id: ride.rideId,
                name: user.name,
                email: user.email,
                amount: `+$${parseFloat(ride.farePrice).toFixed(2)}`,
                type: 'user' as const,
              }));
            } catch (err) {
              console.error(`Error fetching rides for user ${user.id}:`, err);
              return [];
            }
          });

          rides = (await Promise.all(userRidesPromises)).flat()
            .sort((a, b) => b.id - a.id)
            .slice(0, limit);

        } else if (viewType === 'drivers') {
          const driversResponse = await api.get<DriverResponse[]>(`/admin/drivers?limit=${limit}`, { headers });
          const drivers = driversResponse.data || [];

          const driverRidesPromises = drivers.map(async (driver) => {
            try {
              const driverRidesResponse = await api.get<DriverRide[]>(`/api/driver/${driver.id}/rides?status=completed&limit=5`, { headers });
              return (driverRidesResponse.data || []).map(ride => ({
                id: ride.rideId,
                name: ride.driver ? `${ride.driver.firstName} ${ride.driver.lastName}` : 'Unknown Driver',
                email: ride.user?.email || 'N/A',
                amount: `+$${ride.farePrice?.toFixed(2) ?? '0.00'}`,
                type: 'driver' as const,
              }));
            } catch (err) {
              console.error(`Error fetching rides for driver ${driver.id}:`, err);
              return [];
            }
          });

          rides = (await Promise.all(driverRidesPromises)).flat()
            .sort((a, b) => b.id - a.id)
            .slice(0, limit);
        }

        setRecentRides(rides);
      } catch (err) {
        console.error('Failed to fetch recent rides:', err);
        setError('Error al cargar las carreras recientes.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentRides();
    const intervalId = setInterval(fetchRecentRides, 30000);
    return () => clearInterval(intervalId);

  }, [session, viewType, limit]);

  if (!session) {
    return <p className="text-red-500">Debes iniciar sesión para ver las carreras.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-center space-x-4 mb-4">
        <Button onClick={() => setViewType('users')} variant={viewType === 'users' ? 'default' : 'outline'}>
          Carreras de Usuarios
        </Button>
        <Button onClick={() => setViewType('drivers')} variant={viewType === 'drivers' ? 'default' : 'outline'}>
          Carreras de Taxistas/Repartidores
        </Button>
      </div>

      {loading && <p>Cargando carreras...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && recentRides.length === 0 && <p>No se encontraron carreras recientes.</p>}

      <div className="space-y-8">
        {recentRides.map((ride) => (
          <div key={ride.id} className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0"></div>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none text-foreground">{ride.name}</p>
              <p className="text-sm text-muted-foreground">{ride.email}</p>
            </div>
            <div className="ml-auto font-medium text-foreground">{ride.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
