'use client';

import StatCard from '@/components/StatCard';
import { Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  isActive?: boolean;
  userType?: string;
  adminRole?: string;
  createdAt?: string;
  wallet?: {
    balance: number;
  };
  _count?: {
    rides?: number;
    deliveryOrders?: number;
    ratings?: number;
  };
  clerkId?: string;
}

interface UserListWithPagination {
  data: UserData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    applied: string[];
    searchTerm: string;
  };
}

interface ApiResponseData {
  data: UserListWithPagination;
}

export default function TotalUsersCard() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        if (!API_URL) {
          throw new Error('La URL de la API no está configurada en las variables de entorno.');
        }
        const response = await axios.get<ApiResponseData>(`${API_URL}api/user?limit=1`);
        if (response.data && response.data.data && response.data.data.pagination) {
          setTotalUsers(response.data.data.pagination.total);
        } else {
          setError('Datos de usuarios no encontrados o formato inválido.');
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          setError(`Error al obtener total de usuarios: ${err.response.data.message || err.message}`);
        } else {
          setError(`Error al obtener total de usuarios: ${err instanceof Error ? err.message : String(err)}`);
        }
        console.error('Error fetching total users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalUsers();
  }, []);

  return (
    <StatCard 
      title="Subscriptions"
      value={loading ? "Cargando..." : error ? "Error" : (totalUsers !== null ? `+${totalUsers}` : "N/A")}
      icon={Users}
      change="+180.1% from last month"
      changeType="increase"
      backgroundImage="/fondo.png" // Asignar la imagen de fondo a TotalUsersCard
    />
  );
}
