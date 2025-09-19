import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api/api-client';
import { Button } from './ui/button';

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

interface ApiResponse<T> {
  data: T;
  // Add other common response fields if they exist
}

export default function RecentSales() {
  const [viewType, setViewType] = useState<'users' | 'drivers'>('users');
  const [recentRides, setRecentRides] = useState<RideData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit] = useState(100); // Fixed limit for fetching latest items

  // Effect for initial load and viewType changes
  useEffect(() => {
    const fetchRecentRides = async () => {
      setLoading(true);
      setError(null);

      try {
        let rides: RideData[] = [];

        if (viewType === 'users') {
          const usersResponse = await api.get<UserResponse[]>(`admin/users?limit=${limit}`);
          const users = usersResponse.data || [];

          const userRidesPromises = users.map(async (user: UserResponse) => {
            try {
              const userRidesResponse = await api.get<UserRide[]>(`/api/ride/${user.id}`);
              const userRides = userRidesResponse.data || [];
              
              return userRides.map((ride: UserRide) => ({
                id: ride.rideId,
                name: user.name,
                email: user.email,
                amount: `+$${parseFloat(ride.farePrice).toFixed(2) || '0.00'}`,
                type: 'user' as const,
              }));
            } catch (userRideError) {
              console.error(`Error fetching rides for user ${user.id}:`, userRideError);
              return [];
            }
          });
          
          const allUserRides = (await Promise.all(userRidesPromises)).flat();
          rides = allUserRides.sort((a: RideData, b: RideData) => b.id - a.id).slice(0, limit);

        } else if (viewType === 'drivers') {
          const driversResponse = await api.get<DriverResponse[]>(`/admin/drivers?limit=${limit}`);
          const drivers = driversResponse.data || [];

          const driverRidesPromises = drivers.map(async (driver: DriverResponse) => {
            try {
              const driverRidesResponse = await api.get<DriverRide[]>(`/api/driver/${driver.id}/rides?status=completed&limit=5`);
              const driverRides = driverRidesResponse.data || [];
              if (!Array.isArray(driverRides)) {
                console.warn(`API for driver ${driver.id} did not return an array for rides:`, driverRides);
                return [];
              }
              return driverRides.map((ride: DriverRide) => ({
                id: ride.rideId,
                name: ride.driver ? `${ride.driver.firstName} ${ride.driver.lastName}` : 'Unknown Driver',
                email: ride.user?.email || 'N/A',
                amount: `+$${ride.farePrice ? ride.farePrice.toFixed(2) : '0.00'}`,
                type: 'driver' as const,
              }) as RideData);
            } catch (driverRideError) {
              console.error(`Error fetching rides for driver ${driver.id}:`, driverRideError);
              return [];
            }
          });
          const allDriverRides = (await Promise.all(driverRidesPromises)).flat();
          rides = allDriverRides.sort((a: RideData, b: RideData) => b.id - a.id).slice(0, limit); // Take the latest 'limit' rides
        }

        setRecentRides(rides);
      } catch (err) {
        console.error('Failed to fetch recent rides:', err);
        console.error('Error completo al cargar carreras recientes:', JSON.stringify(err));
        setError('Error al cargar las carreras recientes.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentRides();

    const intervalId = setInterval(fetchRecentRides, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId);
  }, [viewType, limit]); // Re-run effect when viewType or limit changes

  return (
    <div className="space-y-8">
      <div className="flex justify-center space-x-4 mb-4">
        <Button
          onClick={() => setViewType('users')}
          variant={viewType === 'users' ? 'default' : 'outline'}
        >
          Carreras de Usuarios
        </Button>
        <Button
          onClick={() => setViewType('drivers')}
          variant={viewType === 'drivers' ? 'default' : 'outline'}
        >
          Carreras de Taxistas/Repartidores
        </Button>
      </div>

      {loading && <p>Cargando carreras...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && recentRides.length === 0 && (
        <p>No se encontraron carreras recientes.</p>
      )}

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
