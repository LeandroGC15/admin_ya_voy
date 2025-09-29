export interface BaseResponse {
  success: boolean;
  message: string;
}

export interface DeleteDriverResponse extends BaseResponse {
  driverId: string;
}

export interface RegisterDriverPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  carModel: string;
  licensePlate: string;
  carSeats: number;
  clerkId: string;
}

export interface DriverData {
  id: number;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  carModel?: string;
  licensePlate?: string;
  carSeats?: number;
  status?: 'online' | 'offline' | 'busy' | 'unavailable';
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'under_review';
  canDoDeliveries?: boolean;
  createdAt?: string;
  updatedAt?: string;
  vehicleType?: {
    id: number;
    name: string;
    displayName: string;
  };
  documents?: Array<{
    id: number;
    documentType: string;
    verificationStatus: string;
    uploadedAt: string;
  }>;
  _count?: {
    documents?: number;
  };
}

// Conteos asociados al conductor
export interface DriverCount {
  rides: number;
  deliveryOrders: number;
  documents: number;
}

// Objeto de un conductor individual
export interface Driver {
  id: number;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  carModel: string;
  licensePlate: string;
  carSeats: number;
  status: "online" | "offline"; // restringimos a los valores que vemos
  verificationStatus: "pending" | "verified"; // restringimos también
  canDoDeliveries: boolean;
  createdAt: string; // ISO date string
  _count: DriverCount;
}

// Paginación
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Contenedor principal de la data
export interface DriversData {
  success: boolean;
  data: Driver[];
  pagination: Pagination;
}