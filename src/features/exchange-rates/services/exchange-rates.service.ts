import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type {
  ExchangeRateData,
  ExchangeRateHistoryData,
  ExchangeRateStatsData,
  ExchangeRateTestFetchData,
  ExchangeRateResetData,
  ExchangeRateHealthData,
} from '../interfaces/exchange-rates';

/**
 * Fetches the latest exchange rate from the API
 * Uses the standard api-client which automatically extracts the data field from ApiResponse<T>
 */
export const fetchLatestExchangeRate = async (): Promise<ExchangeRateData> => {
  try {
    // Use the api-client which returns AxiosResponse<T> where T is the extracted data
    const response = await api.get<ExchangeRateData>(ENDPOINTS.exchangeRates.latest);
    const data = response.data; // The interceptor extracts the data field automatically

    // Basic validation
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data structure received from API');
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching latest exchange rate:', error);
    throw error;
  }
};

/**
 * Fetches exchange rate history with optional limit
 * Uses the standard api-client which automatically extracts the data field from ApiResponse<T>
 */
export const fetchExchangeRateHistory = async (limit: number = 50): Promise<ExchangeRateHistoryData> => {
  try {
    const response = await api.get<ExchangeRateHistoryData>(ENDPOINTS.exchangeRates.history, {
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
 * Uses the standard api-client which automatically extracts the data field from ApiResponse<T>
 */
export const fetchExchangeRateStats = async (days: number = 7): Promise<ExchangeRateStatsData> => {
  try {
    const response = await api.get<ExchangeRateStatsData>(ENDPOINTS.exchangeRates.stats, {
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
 * Uses the standard api-client which automatically extracts the data field from ApiResponse<T>
 */
export const testExchangeRateFetch = async (): Promise<ExchangeRateTestFetchData> => {
  try {
    const response = await api.get<ExchangeRateTestFetchData>(ENDPOINTS.exchangeRates.testFetch);
    return response.data;
  } catch (error) {
    console.error('Error testing exchange rate fetch:', error);
    throw error;
  }
};

/**
 * Manually updates the exchange rate from the external API
 * Uses the standard api-client which automatically extracts the data field from ApiResponse<T>
 */
export const updateExchangeRate = async (): Promise<ExchangeRateData> => {
  try {
    const response = await api.post<ExchangeRateData>(ENDPOINTS.exchangeRates.update);
    return response.data;
  } catch (error) {
    console.error('Error updating exchange rate:', error);
    throw error;
  }
};

/**
 * Resets the exchange rate data (clears DB and fetches fresh data)
 * Uses the standard api-client which automatically extracts the data field from ApiResponse<T>
 */
export const resetExchangeRates = async (): Promise<ExchangeRateResetData> => {
  try {
    const response = await api.post<ExchangeRateResetData>(ENDPOINTS.exchangeRates.reset);
    return response.data;
  } catch (error) {
    console.error('Error resetting exchange rates:', error);
    throw error;
  }
};

/**
 * Checks the health status of the exchange rates system
 * Uses the standard api-client which automatically extracts the data field from ApiResponse<T>
 * For health endpoint, if the API returns an error response, we handle it gracefully
 */
export const checkExchangeRateHealth = async (): Promise<ExchangeRateHealthData> => {
  try {
    const response = await api.get<ExchangeRateHealthData>(ENDPOINTS.exchangeRates.health);
    return response.data;
  } catch (error) {
    console.error('Error checking exchange rate health:', error);
    // For health checks, we return a default unhealthy status on error
    return {
      status: 'unhealthy',
      apiUrl: 'unknown',
    };
  }
};
