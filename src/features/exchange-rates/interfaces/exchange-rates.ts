// Exchange Rate Data Interfaces
export interface ExchangeRateData {
  id: string;
  currency: string;
  rate: number;
  compra?: number | null;
  venta?: number | null;
  source: string;
  casa?: string;
  fechaActualizacion?: string;
  createdAt: string;
  updatedAt: string;
}

// Health data structure (what API client returns after processing)
export interface ExchangeRateHealthData {
  status: 'healthy' | 'unhealthy';
  lastUpdate?: string;
  apiUrl: string;
}

// Reset data structure (what API client returns after processing)
export interface ExchangeRateResetData {
  deletedRecords: number;
  newData: ExchangeRateData;
}

// Test fetch data structure (what API client returns after processing)
export interface ExchangeRateTestFetchData {
  currency: string;
  rate: number;
  compra?: number | null;
  venta?: number | null;
  source: string;
  casa?: string;
  fechaActualizacion?: string;
}

// History data structure (what API client returns after processing)
export interface ExchangeRateHistoryData {
  data: ExchangeRateData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Stats data structure (what API client returns after processing)
export interface ExchangeRateStatsData {
  period: string;
  count: number;
  latest: number;
  minimum: number;
  maximum: number;
  average: number;
  variation: number;
  trend: 'up' | 'down' | 'stable';
  data: ExchangeRateData[];
}

// Error interfaces
export interface ExchangeRateErrorResponse {
  success: false;
  message: string;
  error?: string;
  timestamp: string;
}
