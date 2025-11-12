import { z } from 'zod';

// Enums
export const verificationStatusSchema = z.enum(['PENDING', 'VERIFIED', 'REJECTED']);
export const onboardingStageSchema = z.enum(['personal-data', 'documents', 'vehicles', 'programa-yavoy', 'completed']);
export const vehicleTypeSchema = z.enum(['carro', 'moto']);
export const sortBySchema = z.enum(['createdAt', 'progress', 'name']);
export const sortOrderSchema = z.enum(['asc', 'desc']);

// Query Schemas
export const getOnboardingDriversQuerySchema = z.object({
  onboardingStage: z.array(onboardingStageSchema).optional(),
  vehicleType: z.array(vehicleTypeSchema).optional(),
  verificationStatus: z.array(verificationStatusSchema).optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minProgress: z.number().min(0).max(100).optional(),
  maxProgress: z.number().min(0).max(100).optional(),
  hasPendingDocuments: z.boolean().optional(),
  hasPendingVehicles: z.boolean().optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
  sortBy: sortBySchema.optional().default('createdAt'),
  sortOrder: sortOrderSchema.optional().default('desc'),
});

export const getPendingDocumentsQuerySchema = z.object({
  documentType: z.string().optional(),
  driverId: z.number().optional(),
  search: z.string().optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
});

export const getPendingVehiclesQuerySchema = z.object({
  vehicleType: vehicleTypeSchema.optional(),
  driverId: z.number().optional(),
  search: z.string().optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
});

// Verification Request Schemas
export const verifyDocumentSchema = z.object({
  verificationStatus: verificationStatusSchema,
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
}).refine(
  (data) => {
    if (data.verificationStatus === 'REJECTED' && !data.rejectionReason) {
      return false;
    }
    return true;
  },
  {
    message: 'Rejection reason is required when rejecting a document',
    path: ['rejectionReason'],
  }
);

export const rejectDocumentSchema = z.object({
  verificationStatus: z.literal('REJECTED'),
  notes: z.string().optional(),
  rejectionReason: z.string().min(1, 'Rejection reason is required'),
});

export const bulkVerifyDocumentsSchema = z.object({
  documentIds: z.array(z.number()).min(1, 'At least one document ID is required'),
  verificationStatus: verificationStatusSchema,
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
}).refine(
  (data) => {
    if (data.verificationStatus === 'REJECTED' && !data.rejectionReason) {
      return false;
    }
    return true;
  },
  {
    message: 'Rejection reason is required when rejecting documents',
    path: ['rejectionReason'],
  }
);

export const verifyVehicleSchema = z.object({
  verificationStatus: verificationStatusSchema,
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
  verifyDocuments: z.boolean().optional().default(false),
}).refine(
  (data) => {
    if (data.verificationStatus === 'REJECTED' && !data.rejectionReason) {
      return false;
    }
    return true;
  },
  {
    message: 'Rejection reason is required when rejecting a vehicle',
    path: ['rejectionReason'],
  }
);

export const rejectVehicleSchema = z.object({
  verificationStatus: z.literal('REJECTED'),
  notes: z.string().optional(),
  rejectionReason: z.string().min(1, 'Rejection reason is required'),
  verifyDocuments: z.boolean().optional().default(false),
});

export const verifyVehicleDocumentSchema = z.object({
  verificationStatus: verificationStatusSchema,
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
}).refine(
  (data) => {
    if (data.verificationStatus === 'REJECTED' && !data.rejectionReason) {
      return false;
    }
    return true;
  },
  {
    message: 'Rejection reason is required when rejecting a vehicle document',
    path: ['rejectionReason'],
  }
);

export const bulkVerifyVehiclesSchema = z.object({
  vehicleIds: z.array(z.number()).min(1, 'At least one vehicle ID is required'),
  verificationStatus: verificationStatusSchema,
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
  verifyDocuments: z.boolean().optional().default(false),
}).refine(
  (data) => {
    if (data.verificationStatus === 'REJECTED' && !data.rejectionReason) {
      return false;
    }
    return true;
  },
  {
    message: 'Rejection reason is required when rejecting vehicles',
    path: ['rejectionReason'],
  }
);

export const approveDriverSchema = z.object({
  notes: z.string().optional(),
});

export const bulkApproveDriverSchema = z.object({
  driverIds: z.array(z.number()).min(1, 'At least one driver ID is required'),
  notes: z.string().optional(),
});

// Type exports
export type GetOnboardingDriversQuery = z.infer<typeof getOnboardingDriversQuerySchema>;
export type GetPendingDocumentsQuery = z.infer<typeof getPendingDocumentsQuerySchema>;
export type GetPendingVehiclesQuery = z.infer<typeof getPendingVehiclesQuerySchema>;
export type VerifyDocumentInput = z.infer<typeof verifyDocumentSchema>;
export type RejectDocumentInput = z.infer<typeof rejectDocumentSchema>;
export type BulkVerifyDocumentsInput = z.infer<typeof bulkVerifyDocumentsSchema>;
export type VerifyVehicleInput = z.infer<typeof verifyVehicleSchema>;
export type RejectVehicleInput = z.infer<typeof rejectVehicleSchema>;
export type VerifyVehicleDocumentInput = z.infer<typeof verifyVehicleDocumentSchema>;
export type BulkVerifyVehiclesInput = z.infer<typeof bulkVerifyVehiclesSchema>;
export type ApproveDriverInput = z.infer<typeof approveDriverSchema>;
export type BulkApproveDriverInput = z.infer<typeof bulkApproveDriverSchema>;



