import { useApiQuery, useApiMutation } from '@/lib/api/react-query-client';
import {
  fetchLatestExchangeRate,
  fetchExchangeRateHistory,
  fetchExchangeRateStats,
  testExchangeRateFetch,
  updateExchangeRate,
  resetExchangeRates,
  checkExchangeRateHealth,
} from '../services/exchange-rates.service';
import type {
  ExchangeRateData,
  ExchangeRateHistoryData,
  ExchangeRateTestFetchData,
  ExchangeRateResetData,
  ExchangeRateHealthData
} from '../interfaces/exchange-rates';

// Hook para obtener el precio más reciente del dólar
export function useLatestExchangeRate() {
  return useApiQuery(
    ['exchange-rates', 'latest'],
    async (): Promise<ExchangeRateData> => {
      try {
        const data = await fetchLatestExchangeRate();
        if (!data) {
          throw new Error('No exchange rate data received');
        }
        return data;
      } catch (error: any) {
        console.error('❌ Error in useLatestExchangeRate:', error);
        throw error;
      }
    },
    {
      enabled: true,
      // Actualizar cada 5 minutos
      refetchInterval: 5 * 60 * 1000,
      // Mantener en cache por 10 minutos
      staleTime: 10 * 60 * 1000,
      cacheTime: 15 * 60 * 1000,
    }
  );
}

// Hook para obtener historial de precios
export function useExchangeRateHistory(limit: number = 50) {
  return useApiQuery(
    ['exchange-rates', 'history', limit],
    async (): Promise<ExchangeRateHistoryData> => {
      try {
        const data = await fetchExchangeRateHistory(limit);
        return data;
      } catch (error: any) {
        console.error('Error in useExchangeRateHistory:', error);
        throw error;
      }
    },
    {
      enabled: true,
      // Actualizar cada 15 minutos
      refetchInterval: 15 * 60 * 1000,
      staleTime: 30 * 60 * 1000,
      cacheTime: 60 * 60 * 1000,
    }
  );
}

// Hook para obtener estadísticas
export function useExchangeRateStats(days: number = 7) {
  return useApiQuery(
    ['exchange-rates', 'stats', days],
    async (): Promise<any> => {
      try {
        const data = await fetchExchangeRateStats(days);
        return data;
      } catch (error: any) {
        console.error('Error in useExchangeRateStats:', error);
        throw error;
      }
    },
    {
      enabled: true,
      // Actualizar cada 30 minutos
      refetchInterval: 30 * 60 * 1000,
      staleTime: 60 * 60 * 1000,
      cacheTime: 120 * 60 * 1000,
    }
  );
}

// Hook para probar el fetch directo
export function useTestExchangeRateFetch() {
  return useApiMutation(
    async (): Promise<ExchangeRateTestFetchData> => {
      try {
        const data = await testExchangeRateFetch();
        return data;
      } catch (error: any) {
        console.error('Error in useTestExchangeRateFetch:', error);
        throw error;
      }
    },
    {
      onSuccess: () => {
        console.log('✅ Exchange rate fetch test completed successfully');
      },
      onError: (error: any) => {
        console.error('❌ Exchange rate fetch test failed:', error);
      },
    }
  );
}

// Hook para actualizar manualmente
export function useUpdateExchangeRate() {
  return useApiMutation(
    async (): Promise<ExchangeRateData> => {
      try {
        const data = await updateExchangeRate();
        return data;
      } catch (error: any) {
        console.error('Error in useUpdateExchangeRate:', error);
        throw error;
      }
    },
    {
      onSuccess: (data) => {
        console.log('✅ Exchange rate updated successfully:', data.rate);
        // Invalidar queries relacionadas
        // Esto sería manejado por el componente que use el hook
      },
      onError: (error: any) => {
        console.error('❌ Exchange rate update failed:', error);
      },
    }
  );
}

// Hook para resetear datos
export function useResetExchangeRates() {
  return useApiMutation(
    async (): Promise<ExchangeRateResetData> => {
      try {
        const data = await resetExchangeRates();
        return data;
      } catch (error: any) {
        console.error('Error in useResetExchangeRates:', error);
        throw error;
      }
    },
    {
      onSuccess: (data) => {
        console.log('✅ Exchange rates reset successfully. Deleted:', data.deletedRecords, 'New rate:', data.newData.rate);
        // Invalidar todas las queries relacionadas
        // Esto sería manejado por el componente que use el hook
      },
      onError: (error: any) => {
        console.error('❌ Exchange rates reset failed:', error);
      },
    }
  );
}

// Hook para verificar estado del sistema
export function useExchangeRateHealth() {
  return useApiQuery(
    ['exchange-rates', 'health'],
    async (): Promise<ExchangeRateHealthData> => {
      try {
        const data = await checkExchangeRateHealth();
        return data;
      } catch (error: any) {
        console.error('Error in useExchangeRateHealth:', error);
        return {
          status: 'unhealthy',
          apiUrl: 'unknown',
        };
      }
    },
    {
      enabled: true,
      // Verificar cada 10 minutos
      refetchInterval: 10 * 60 * 1000,
      staleTime: 5 * 60 * 1000,
      cacheTime: 15 * 60 * 1000,
    }
  );
}
