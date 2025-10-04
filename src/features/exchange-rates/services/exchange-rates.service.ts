import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type {
  ExchangeRateData,
  ExchangeRateResponse,
  ExchangeRateHistoryResponse,
  ExchangeRateStatsResponse,
  ExchangeRateTestFetchResponse,
  ExchangeRateUpdateResponse,
  ExchangeRateResetResponse,
  ExchangeRateHealthResponse,
} from '../interfaces/exchange-rates';

/**
 * Fetches the latest exchange rate from the API
 */
export const fetchLatestExchangeRate = async (): Promise<ExchangeRateData> => {
  try {
    const response = await api.get<ExchangeRateResponse>(ENDPOINTS.exchangeRates.latest);
    return response.data;
  } catch (error) {
    console.error('Error fetching latest exchange rate:', error);
    throw error;
  }
};

/**
 * Fetches exchange rate history with optional limit
 */
export const fetchExchangeRateHistory = async (limit: number = 50): Promise<ExchangeRateData[]> => {
  try {
    const response = await api.get<ExchangeRateHistoryResponse>(ENDPOINTS.exchangeRates.history, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching exchange rate history:', error);
    throw error;
  }
};

/**
 * Fetches exchange rate statistics for a given period
 */
export const fetchExchangeRateStats = async (days: number = 7): Promise<ExchangeRateStatsResponse['data']> => {
  try {
    const response = await api.get<ExchangeRateStatsResponse>(ENDPOINTS.exchangeRates.stats, {
      params: { days },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching exchange rate stats:', error);
    throw error;
  }
};

/**
 * Tests the API connection by fetching directly from the external API
 */
export const testExchangeRateFetch = async (): Promise<ExchangeRateTestFetchResponse['data']> => {
  try {
    const response = await api.get<ExchangeRateTestFetchResponse>(ENDPOINTS.exchangeRates.testFetch);
    return response.data;
  } catch (error) {
    console.error('Error testing exchange rate fetch:', error);
    throw error;
  }
};

/**
 * Manually updates the exchange rate from the external API
 */
export const updateExchangeRate = async (): Promise<ExchangeRateData> => {
  try {
    const response = await api.post<ExchangeRateUpdateResponse>(ENDPOINTS.exchangeRates.update);
    return response.data;
  } catch (error) {
    console.error('Error updating exchange rate:', error);
    throw error;
  }
};

/**
 * Resets the exchange rate data (clears DB and fetches fresh data)
 */
export const resetExchangeRates = async (): Promise<{
  deletedRecords: number;
  newData: ExchangeRateData;
}> => {
  try {
    const response = await api.post<ExchangeRateResetResponse>(ENDPOINTS.exchangeRates.reset);
    return {
      deletedRecords: response.data.deletedRecords,
      newData: response.data.newData,
    };
  } catch (error) {
    console.error('Error resetting exchange rates:', error);
    throw error;
  }
};

/**
 * Checks the health status of the exchange rates system
 */
export const checkExchangeRateHealth = async (): Promise<{
  status: 'healthy' | 'unhealthy';
  lastUpdate?: string;
  apiUrl: string;
}> => {
  try {
    const response = await api.get<ExchangeRateHealthResponse>(ENDPOINTS.exchangeRates.health);
    return {
      status: response.data.status,
      lastUpdate: response.data.lastUpdate,
      apiUrl: response.data.apiUrl,
    };
  } catch (error) {
    console.error('Error checking exchange rate health:', error);
    throw error;
  }
};
