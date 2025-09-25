"use client";

import React, { useState, useEffect } from "react";
import { api } from "../lib/api/api-client";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";

// Interfaces 
//Vehículo solicitado 

interface RequestedVehicleType { id: number; name: string; displayName: string; icon: string; isActive: boolean; createdAt: string; updatedAt: string; } 
// Nivel o categoría de la carrera 
interface Tier { id: number; name: string; baseFare: string; perMinuteRate: string; perMileRate: string; imageUrl: string; }
 // Conductor (puede ser null si no hay conductor asignado)
interface Driver { id: number; firstName: string; lastName: string; profileImageUrl: string; carImageUrl: string; carModel: string; licensePlate: string; carSeats: number; vehicleTypeId: number; status: string; verificationStatus: string; canDoDeliveries: boolean; currentLatitude: string; currentLongitude: string; lastLocationUpdate: string; locationAccuracy: number | null; isLocationActive: boolean; createdAt: string; updatedAt: string; vehicleType: { id: number; name: string; displayName: string; icon: string; isActive: boolean; createdAt: string; updatedAt: string; }; } 
// Calificación de la carrera 
interface Rating { id: number; rideId: number; orderId?: number | null; storeId?: number | null; ratedByUserId: number; ratedUserId: number; ratingValue: number; comment: string; createdAt: string; } 
// Mensaje asociado a la carrera 
interface Message { id: number; rideId: number; orderId?: number | null; errandId?: number | null; parcelId?: number | null; senderId: number; messageText: string; createdAt: string; }
 // Carrera completa export 
 interface RideDetail { rideId: number; originAddress: string; destinationAddress: string; originLatitude: string; originLongitude: string; destinationLatitude: string; destinationLongitude: string; rideTime: number; farePrice: string; paymentStatus: string; status: string; driverId: number | null; userId: number; tierId: number; requestedVehicleTypeId: number | null; scheduledFor: string | null; cancelledAt: string | null; cancelledBy: string | null; cancellationReason: string | null; cancellationNotes: string | null; createdAt: string; updatedAt: string; driver: Driver | null; tier: Tier; requestedVehicleType: RequestedVehicleType | null; ratings: Rating[]; messages: Message[]; }



interface User {
  id: number;
  name: string;
  email: string;
}

interface DriverSummary {
  id: number;
  firstName: string;
  lastName: string;
}

interface RideData {
  id: number;
  name: string;
  email: string;
  amount: string;
  type: "user" | "driver";
}

export default function RecentSales() {
  const { data: session } = useSession();
  const [viewType, setViewType] = useState<"users" | "drivers">("users");
  const [recentRides, setRecentRides] = useState<RideData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit] = useState(100);

  useEffect(() => {
    if (!session?.accessToken) {
      setError("No tienes sesión activa");
      setLoading(false);
      return;
    }

    const fetchRecentRides = async () => {
      setLoading(true);
      setError(null);
      const headers = { Authorization: `Bearer ${session.accessToken}` };

      try {
        let rides: RideData[] = [];

        if (viewType === "users") {
          const usersResponse = await api.get<User[]>("/admin/users?limit=" + limit, { headers });
          const users = usersResponse.data ?? [];

          const userRidesPromises = users.map(async (user) => {
            const response = await api.get<RideDetail[]>(`/api/ride/${user.id}`, { headers });
            const userRides = response.data ?? [];
            return userRides.map((ride) => ({
              id: ride.rideId,
              name: user.name,
              email: ride.driver ? `${ride.driver.firstName} ${ride.driver.lastName}` : "Pendiente",
              amount: `+$${parseFloat(ride.farePrice).toFixed(2)}`,
              type: "user" as const,
            }));
          });

          rides = (await Promise.all(userRidesPromises)).flat()
            .sort((a, b) => b.id - a.id)
            .slice(0, limit);

        } else if (viewType === "drivers") {
          const driversResponse = await api.get<DriverSummary[]>("/admin/drivers?limit=" + limit, { headers });
          const drivers = driversResponse.data ?? [];

          const driverRidesPromises = drivers.map(async (driver) => {
            const response = await api.get<RideDetail[]>(`/api/driver/${driver.id}/rides?status=completed&limit=5`, { headers });
            const driverRides = response.data ?? [];
            return driverRides.map((ride) => ({
              id: ride.rideId,
              name: `${driver.firstName} ${driver.lastName}`,
              email: ride.userId ? `Usuario #${ride.userId}` : "Pendiente",
              amount: `+$${parseFloat(ride.farePrice).toFixed(2)}`,
              type: "driver" as const,
            }));
          });

          rides = (await Promise.all(driverRidesPromises)).flat()
            .sort((a, b) => b.id - a.id)
            .slice(0, limit);
        }

        setRecentRides(rides);
      } catch (err) {
        console.error("Error fetching recent rides:", err);
        setError("Error al cargar las carreras recientes.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentRides();
    const intervalId = setInterval(fetchRecentRides, 30000);
    return () => clearInterval(intervalId);
  }, [session, viewType, limit]);

  if (!session) return <p className="text-red-500">Debes iniciar sesión para ver las carreras.</p>;

  return (
    <div className="space-y-8">
      <div className="flex justify-center space-x-4 mb-4">
        <Button
          onClick={() => setViewType("users")}
          variant={viewType === "users" ? "default" : "outline"}
        >
          Carreras de Usuarios
        </Button>
        <Button
          onClick={() => setViewType("drivers")}
          variant={viewType === "drivers" ? "default" : "outline"}
        >
          Carreras de Conductores
        </Button>
      </div>

      {loading && <p>Cargando carreras...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && recentRides.length === 0 && (
        <p>No se encontraron carreras recientes.</p>
      )}

      <div className="space-y-4">
        {recentRides.map((ride) => (
          <div key={ride.id} className="flex items-center p-2 border rounded-md">
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
