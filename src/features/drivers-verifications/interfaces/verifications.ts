/**
 * TypeScript interfaces for Driver Verifications module
 * Based on backend DTOs
 */

// Enums
export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export type OnboardingStage = 'personal-data' | 'documents' | 'vehicles' | 'programa-yavoy' | 'completed';
export type VehicleType = 'carro' | 'moto';
export type SortBy = 'createdAt' | 'progress' | 'name';
export type SortOrder = 'asc' | 'desc';

// Query DTOs
export interface GetOnboardingDriversQuery {
  onboardingStage?: OnboardingStage[];
  vehicleType?: VehicleType[];
  verificationStatus?: VerificationStatus[];
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minProgress?: number;
  maxProgress?: number;
  hasPendingDocuments?: boolean;
  hasPendingVehicles?: boolean;
  page?: number;
  limit?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

export interface GetPendingDocumentsQuery {
  documentType?: string;
  driverId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetPendingVehiclesQuery {
  vehicleType?: VehicleType;
  driverId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// Response DTOs
export interface StageProgress {
  completed: boolean;
  progress: number;
  completedSteps: number;
  totalSteps: number;
}

export interface OnboardingDriverListItem {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  profileImageUrl?: string;
  overallProgress: number;
  currentStage: string;
  verificationStatus: string;
  pendingDocumentsCount: number;
  pendingVehiclesCount: number;
  createdAt: string | Date;
  lastUpdated: string | Date;
}

export interface OnboardingDriverResponse {
  driver: {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    profileImageUrl?: string;
    verificationStatus: string;
    createdAt: string | Date;
  };
  onboardingProgress: {
    overallProgress: number;
    currentStage: string;
    stages: {
      personalData: StageProgress;
      documents: StageProgress;
      vehicles: StageProgress;
      programaYavoy: StageProgress;
    };
  };
  pendingDocuments: Array<{
    id: number;
    documentType: string;
    documentUrl: string;
    verificationStatus: string;
    uploadedAt: string | Date;
  }>;
  pendingVehicles: Array<{
    id: number;
    make: string;
    model: string;
    licensePlate: string;
    verificationStatus: string;
    vehicleType: VehicleType;
  }>;
  vehicles: Array<{
    id: number;
    make: string;
    model: string;
    year: number;
    color?: string;
    licensePlate: string;
    vehicleType: VehicleType;
    verificationStatus: string;
    documents: Array<{
      id: number;
      documentType: string;
      documentUrl: string;
      verificationStatus: string;
      uploadedAt: string | Date;
    }>;
  }>;
  lastUpdated: string | Date;
}

export interface OnboardingStatsResponse {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  byStage: {
    personalData: number;
    documents: number;
    vehicles: number;
    programaYavoy: number;
  };
  byVehicleType: {
    carro: number;
    moto: number;
  };
}

export interface OnboardingDriversListResponse {
  drivers: OnboardingDriverListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Document interfaces
export interface DocumentVerificationResponse {
  id: number;
  documentType: string;
  documentUrl: string;
  verificationStatus: string;
  uploadedAt: string | Date;
  verifiedAt?: string | Date;
  rejectionReason?: string;
  driver: {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
}

export interface PendingDocumentsListResponse {
  documents: DocumentVerificationResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VerifyDocumentRequest {
  verificationStatus: VerificationStatus;
  notes?: string;
  rejectionReason?: string;
}

export interface BulkVerifyDocumentsRequest {
  documentIds: number[];
  verificationStatus: VerificationStatus;
  notes?: string;
  rejectionReason?: string;
}

// Vehicle interfaces
export interface VehicleDocument {
  id: number;
  documentType: string;
  documentUrl: string;
  verificationStatus: string;
  uploadedAt: string | Date;
  verifiedAt?: string | Date;
  rejectionReason?: string;
}

export interface VehicleVerificationResponse {
  id: number;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color?: string;
  vehicleType: VehicleType;
  verificationStatus: string;
  documents: VehicleDocument[];
  driver: {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  createdAt: string | Date;
}

export interface PendingVehiclesListResponse {
  vehicles: VehicleVerificationResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VerifyVehicleRequest {
  verificationStatus: VerificationStatus;
  notes?: string;
  rejectionReason?: string;
  verifyDocuments?: boolean;
}

export interface VerifyVehicleDocumentRequest {
  verificationStatus: VerificationStatus;
  notes?: string;
  rejectionReason?: string;
}

export interface BulkVerifyVehiclesRequest {
  vehicleIds: number[];
  verificationStatus: VerificationStatus;
  notes?: string;
  rejectionReason?: string;
  verifyDocuments?: boolean;
}

// Driver approval
export interface ApproveDriverRequest {
  notes?: string;
}

export interface BulkApproveDriverRequest {
  driverIds: number[];
  notes?: string;
}

// Verification history
export interface VerificationHistoryItem {
  id: number;
  previousStatus: string | null;
  newStatus: string;
  changeReason: string;
  additionalNotes?: string | null;
  changedBy: number;
  changedAt: string | Date;
}

// API Response wrappers
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface BulkOperationResponse {
  message: string;
  processed: number;
  failed: number;
}


