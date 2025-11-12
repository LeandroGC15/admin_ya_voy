import { api } from '@/lib/api/api-client';
import { ENDPOINTS, getFullEndpoint } from '@/lib/endpoints';
import type {
  GetOnboardingDriversQuery,
  OnboardingDriversListResponse,
  OnboardingDriverResponse,
  OnboardingStatsResponse,
  GetPendingDocumentsQuery,
  DocumentVerificationResponse,
  PendingDocumentsListResponse,
  VerifyDocumentRequest,
  BulkVerifyDocumentsRequest,
  GetPendingVehiclesQuery,
  VehicleVerificationResponse,
  PendingVehiclesListResponse,
  VerifyVehicleRequest,
  VerifyVehicleDocumentRequest,
  BulkVerifyVehiclesRequest,
  ApproveDriverRequest,
  BulkApproveDriverRequest,
  VerificationHistoryItem,
  BulkOperationResponse,
} from '../interfaces/verifications';

/**
 * Get list of drivers in onboarding with filters
 */
export const getOnboardingDrivers = async (
  query: GetOnboardingDriversQuery = {}
): Promise<OnboardingDriversListResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (query.onboardingStage) {
      query.onboardingStage.forEach(stage => params.append('onboardingStage', stage));
    }
    if (query.vehicleType) {
      query.vehicleType.forEach(type => params.append('vehicleType', type));
    }
    if (query.verificationStatus) {
      query.verificationStatus.forEach(status => params.append('verificationStatus', status));
    }
    if (query.search) params.append('search', query.search);
    if (query.dateFrom) params.append('dateFrom', query.dateFrom);
    if (query.dateTo) params.append('dateTo', query.dateTo);
    if (query.minProgress !== undefined) params.append('minProgress', query.minProgress.toString());
    if (query.maxProgress !== undefined) params.append('maxProgress', query.maxProgress.toString());
    if (query.hasPendingDocuments !== undefined) params.append('hasPendingDocuments', query.hasPendingDocuments.toString());
    if (query.hasPendingVehicles !== undefined) params.append('hasPendingVehicles', query.hasPendingVehicles.toString());
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const endpoint = `${ENDPOINTS.driversVerifications.onboarding}?${params.toString()}`;
    const response = await api.get<OnboardingDriversListResponse>(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error getting onboarding drivers:', error);
    throw error;
  }
};

/**
 * Get detailed onboarding information for a driver
 */
export const getDriverOnboardingDetails = async (
  driverId: string | number
): Promise<OnboardingDriverResponse> => {
  try {
    const response = await api.get<OnboardingDriverResponse>(
      ENDPOINTS.driversVerifications.onboardingById(driverId)
    );
    return response.data;
  } catch (error) {
    console.error(`Error getting driver onboarding details for ${driverId}:`, error);
    throw error;
  }
};

/**
 * Get onboarding statistics
 */
export const getOnboardingStats = async (
  dateFrom?: string,
  dateTo?: string
): Promise<OnboardingStatsResponse> => {
  try {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const endpoint = params.toString()
      ? `${ENDPOINTS.driversVerifications.stats}?${params.toString()}`
      : ENDPOINTS.driversVerifications.stats;
    
    const response = await api.get<OnboardingStatsResponse>(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error getting onboarding stats:', error);
    throw error;
  }
};

/**
 * Get statistics by stage
 */
export const getStatsByStage = async (): Promise<{ byStage: OnboardingStatsResponse['byStage'] }> => {
  try {
    const response = await api.get<{ byStage: OnboardingStatsResponse['byStage'] }>(
      ENDPOINTS.driversVerifications.statsByStage
    );
    return response.data;
  } catch (error) {
    console.error('Error getting stats by stage:', error);
    throw error;
  }
};

/**
 * Get statistics by vehicle type
 */
export const getStatsByVehicleType = async (): Promise<{ byVehicleType: OnboardingStatsResponse['byVehicleType'] }> => {
  try {
    const response = await api.get<{ byVehicleType: OnboardingStatsResponse['byVehicleType'] }>(
      ENDPOINTS.driversVerifications.statsByVehicleType
    );
    return response.data;
  } catch (error) {
    console.error('Error getting stats by vehicle type:', error);
    throw error;
  }
};

/**
 * Get pending documents with filters
 */
export const getPendingDocuments = async (
  query: GetPendingDocumentsQuery = {}
): Promise<PendingDocumentsListResponse> => {
  try {
    const params = new URLSearchParams();
    if (query.documentType) params.append('documentType', query.documentType);
    if (query.driverId) params.append('driverId', query.driverId.toString());
    if (query.search) params.append('search', query.search);
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const endpoint = `${ENDPOINTS.driversVerifications.documents.pending}?${params.toString()}`;
    const response = await api.get<PendingDocumentsListResponse>(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error getting pending documents:', error);
    throw error;
  }
};

/**
 * Get document details
 */
export const getDocumentDetails = async (
  documentId: string | number
): Promise<DocumentVerificationResponse> => {
  try {
    const response = await api.get<DocumentVerificationResponse>(
      ENDPOINTS.driversVerifications.documents.byId(documentId)
    );
    return response.data;
  } catch (error) {
    console.error(`Error getting document details for ${documentId}:`, error);
    throw error;
  }
};

/**
 * Verify a document
 */
export const verifyDocument = async (
  documentId: string | number,
  data: VerifyDocumentRequest
): Promise<{ message: string }> => {
  try {
    const response = await api.put<{ message: string }>(
      ENDPOINTS.driversVerifications.documents.verify(documentId),
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error verifying document ${documentId}:`, error);
    throw error;
  }
};

/**
 * Reject a document
 */
export const rejectDocument = async (
  documentId: string | number,
  data: VerifyDocumentRequest
): Promise<{ message: string }> => {
  try {
    const response = await api.put<{ message: string }>(
      ENDPOINTS.driversVerifications.documents.reject(documentId),
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error rejecting document ${documentId}:`, error);
    throw error;
  }
};

/**
 * Bulk verify documents
 */
export const bulkVerifyDocuments = async (
  data: BulkVerifyDocumentsRequest
): Promise<BulkOperationResponse> => {
  try {
    const response = await api.post<BulkOperationResponse>(
      ENDPOINTS.driversVerifications.documents.bulkVerify,
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error bulk verifying documents:', error);
    throw error;
  }
};

/**
 * Get pending vehicles with filters
 */
export const getPendingVehicles = async (
  query: GetPendingVehiclesQuery = {}
): Promise<PendingVehiclesListResponse> => {
  try {
    const params = new URLSearchParams();
    if (query.vehicleType) params.append('vehicleType', query.vehicleType);
    if (query.driverId) params.append('driverId', query.driverId.toString());
    if (query.search) params.append('search', query.search);
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const endpoint = `${ENDPOINTS.driversVerifications.vehicles.pending}?${params.toString()}`;
    const response = await api.get<PendingVehiclesListResponse>(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error getting pending vehicles:', error);
    throw error;
  }
};

/**
 * Get vehicle details
 */
export const getVehicleDetails = async (
  vehicleId: string | number
): Promise<VehicleVerificationResponse> => {
  try {
    const response = await api.get<VehicleVerificationResponse>(
      ENDPOINTS.driversVerifications.vehicles.byId(vehicleId)
    );
    return response.data;
  } catch (error) {
    console.error(`Error getting vehicle details for ${vehicleId}:`, error);
    throw error;
  }
};

/**
 * Verify a vehicle
 */
export const verifyVehicle = async (
  vehicleId: string | number,
  data: VerifyVehicleRequest
): Promise<{ message: string }> => {
  try {
    const response = await api.put<{ message: string }>(
      ENDPOINTS.driversVerifications.vehicles.verify(vehicleId),
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error verifying vehicle ${vehicleId}:`, error);
    throw error;
  }
};

/**
 * Reject a vehicle
 */
export const rejectVehicle = async (
  vehicleId: string | number,
  data: VerifyVehicleRequest
): Promise<{ message: string }> => {
  try {
    const response = await api.put<{ message: string }>(
      ENDPOINTS.driversVerifications.vehicles.reject(vehicleId),
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error rejecting vehicle ${vehicleId}:`, error);
    throw error;
  }
};

/**
 * Verify a vehicle document
 */
export const verifyVehicleDocument = async (
  vehicleId: string | number,
  documentId: string | number,
  data: VerifyVehicleDocumentRequest
): Promise<{ message: string }> => {
  try {
    const response = await api.put<{ message: string }>(
      ENDPOINTS.driversVerifications.vehicles.verifyDocument(vehicleId, documentId),
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error verifying vehicle document ${documentId} for vehicle ${vehicleId}:`, error);
    throw error;
  }
};

/**
 * Bulk verify vehicles
 */
export const bulkVerifyVehicles = async (
  data: BulkVerifyVehiclesRequest
): Promise<BulkOperationResponse> => {
  try {
    const response = await api.post<BulkOperationResponse>(
      ENDPOINTS.driversVerifications.vehicles.bulkVerify,
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error bulk verifying vehicles:', error);
    throw error;
  }
};

/**
 * Approve a driver (if all onboarding stages are completed)
 */
export const approveDriver = async (
  driverId: string | number,
  data: ApproveDriverRequest = {}
): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>(
      ENDPOINTS.driversVerifications.approve(driverId),
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error approving driver ${driverId}:`, error);
    throw error;
  }
};

/**
 * Get verification history for a driver
 */
export const getVerificationHistory = async (
  driverId: string | number
): Promise<VerificationHistoryItem[]> => {
  try {
    const response = await api.get<VerificationHistoryItem[]>(
      ENDPOINTS.driversVerifications.history(driverId)
    );
    return response.data;
  } catch (error) {
    console.error(`Error getting verification history for driver ${driverId}:`, error);
    throw error;
  }
};



