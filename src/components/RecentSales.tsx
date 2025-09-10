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
          const usersResponse = await api.get<{ data: { id: number; name: string; email: string }[] }>(`/admin/users?limit=${limit}`);
          const users = usersResponse.data;

          const userRidesPromises = users.map(async (user) => {
            try {
              const userRides = await api.get<UserRide[]>(`/api/ride/${user.id}`);
              return userRides.map((ride) => ({
                id: ride.rideId,
                name: user.name,
                email: user.email,
                amount: `+$${parseFloat(ride.farePrice).toFixed(2) || '0.00'}`,
                type: 'user',
              }) as RideData);
            } catch (userRideError) {
              console.error(`Error fetching rides for user ${user.id}:`, userRideError);
              return [];
            }
          });
          const allUserRides = (await Promise.all(userRidesPromises)).flat();
          rides = allUserRides.sort((a, b) => b.id - a.id).slice(0, limit); // Take the latest 'limit' rides

        } else if (viewType === 'drivers') {
          const driversResponse = await api.get<{ data: { id: number; firstName: string; lastName: string }[] }>(`/admin/drivers?limit=${limit}`);
          const drivers = driversResponse.data;

          const driverRidesPromises = drivers.map(async (driver) => {
            try {
              const driverRides = await api.get<DriverRide[]>(`/api/driver/${driver.id}/rides?status=completed&limit=5`); // This limit should also be reviewed if it's not intended for pagination
              return driverRides.map((ride) => ({
                id: ride.rideId,
                name: `${ride.driver.firstName} ${ride.driver.lastName}`,
                email: ride.user?.email || 'N/A',
                amount: `+$${ride.farePrice ? ride.farePrice.toFixed(2) : '0.00'}`,
                type: 'driver',
              }) as RideData);
            } catch (driverRideError) {
              console.error(`Error fetching rides for driver ${driver.id}:`, driverRideError);
              return [];
            }
          });
          const allDriverRides = (await Promise.all(driverRidesPromises)).flat();
          rides = allDriverRides.sort((a, b) => b.id - a.id).slice(0, limit); // Take the latest 'limit' rides
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
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">{ride.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{ride.email}</p>
            </div>
            <div className="ml-auto font-medium text-gray-900 dark:text-white">{ride.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
