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

export interface ExchangeRateResponse {
  success: boolean;
  data: ExchangeRateData;
  timestamp: string;
}

export interface ExchangeRateHistoryResponse {
  success: boolean;
  data: ExchangeRateData[];
  count: number;
  timestamp: string;
}

export interface ExchangeRateStatsResponse {
  success: boolean;
  data: {
    period: string;
    count: number;
    latest: number;
    minimum: number;
    maximum: number;
    average: number;
    variation: number;
    trend: 'up' | 'down' | 'stable';
    data: ExchangeRateData[];
  };
  timestamp: string;
}

export interface ExchangeRateTestFetchResponse {
  success: boolean;
  message: string;
  data: {
    currency: string;
    rate: number;
    compra?: number | null;
    venta?: number | null;
    source: string;
    casa?: string;
    fechaActualizacion?: string;
  };
  timestamp: string;
}

export interface ExchangeRateUpdateResponse {
  success: boolean;
  data: ExchangeRateData;
  message: string;
  timestamp: string;
}

export interface ExchangeRateResetResponse {
  success: boolean;
  message: string;
  deletedRecords: number;
  newData: ExchangeRateData;
  timestamp: string;
}

export interface ExchangeRateHealthResponse {
  success: boolean;
  status: 'healthy' | 'unhealthy';
  lastUpdate?: string;
  apiUrl: string;
  timestamp: string;
}

// Error interfaces
export interface ExchangeRateErrorResponse {
  success: false;
  message: string;
  error?: string;
  timestamp: string;
}
