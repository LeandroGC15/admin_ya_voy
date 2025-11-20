import { z } from 'zod';

// Training Module Schema
export const trainingModuleSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  markdownContent: z.string(),
  videoUrl: z.string().nullable().optional(),
  order: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TrainingModule = z.infer<typeof trainingModuleSchema>;

// Create Module Input Schema
export const createModuleSchema = z.object({
  slug: z.string().min(1, 'El slug es requerido').max(100, 'El slug no puede exceder 100 caracteres'),
  title: z.string().min(1, 'El título es requerido').max(255, 'El título no puede exceder 255 caracteres'),
  summary: z.string().min(1, 'El resumen es requerido'),
  markdownContent: z.string().min(1, 'El contenido es requerido'),
  videoUrl: z.string().url('Debe ser una URL válida').optional().nullable().or(z.literal('')),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;

// Update Module Input Schema
export const updateModuleSchema = createModuleSchema.partial().extend({
  id: z.number(),
});

export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;

// Module List Response Schema
export const moduleListResponseSchema = z.object({
  modules: z.array(trainingModuleSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type ModuleListResponse = z.infer<typeof moduleListResponseSchema>;

// Search Modules Input Schema
export const searchModulesInputSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type SearchModulesInput = z.infer<typeof searchModulesInputSchema>;

