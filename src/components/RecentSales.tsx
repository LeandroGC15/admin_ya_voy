"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRecentRides, type RideData } from "@/features/dashboard";

export default function RecentSales() {
  const { data: session, status } = useSession();
  const [viewType, setViewType] = useState<"users" | "drivers">("users");

  // Use TanStack Query hook for recent rides
  const {
    data: recentRides = [],
    isLoading,
    error,
    refetch,
    isRefetching
  } = useRecentRides(viewType, 20);

  // Handle unauthenticated state
  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Debes iniciar sesión para ver las carreras.</p>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="mx-auto h-8 w-8 animate-spin mb-4 text-gray-500" />
        <p className="text-gray-500">Cargando carreras recientes...</p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-red-500">
          Error al cargar las carreras recientes: {error.message || 'Error desconocido'}
        </p>
        <Button
          onClick={() => refetch()}
          disabled={isRefetching}
          variant="outline"
          size="sm"
        >
          {isRefetching ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Recargando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with title and refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Carreras Recientes</h2>
          <p className="text-sm text-muted-foreground">
            {viewType === "users" ? "Últimas carreras de usuarios" : "Últimas carreras completadas por conductores"}
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isRefetching}
          variant="outline"
          size="sm"
        >
          {isRefetching ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Actualizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </>
          )}
        </Button>
      </div>

      {/* View type selector */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={() => setViewType("users")}
          variant={viewType === "users" ? "default" : "outline"}
          disabled={isLoading || isRefetching}
        >
          Carreras de Usuarios
        </Button>
        <Button
          onClick={() => setViewType("drivers")}
          variant={viewType === "drivers" ? "default" : "outline"}
          disabled={isLoading || isRefetching}
        >
          Carreras de Conductores
        </Button>
      </div>

      {/* Rides list */}
      <div className="space-y-4">
        {recentRides.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron carreras recientes.
          </div>
        ) : (
          recentRides.map((ride: RideData) => (
            <div key={ride.id} className="flex items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-primary">
                  {ride.type === "user" ? "U" : "C"}
                </span>
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium leading-none text-foreground truncate">
                  {ride.name}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {ride.email}
                </p>
              </div>
              <div className="ml-4 font-medium text-foreground">
                {ride.amount}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
