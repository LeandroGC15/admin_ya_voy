// Validation utilities for Service Zones
import type { CreateServiceZoneInput, UpdateServiceZoneInput } from '@/features/config/schemas/service-zones.schemas';
import { validateGeoJSONPolygon } from './geojson-utils';

/**
 * Validate zone data before sending to API
 */
export function validateZoneData(data: CreateServiceZoneInput | UpdateServiceZoneInput | Partial<CreateServiceZoneInput> | Partial<UpdateServiceZoneInput>): string[] {
  const errors: string[] = [];

  // For updates, name and zoneType are optional - only validate if provided
  // For creation, they are required

  // Validate name - only required for creation
  if ('name' in data) {
    if (data.name !== undefined && data.name !== null) {
      // If name is provided, validate it
      if (data.name.trim().length === 0) {
        errors.push('El nombre de la zona no puede estar vacío');
      } else if (data.name.length > 100) {
        errors.push('El nombre de la zona no puede exceder 100 caracteres');
      }
    }
    // For updates, name is optional so we don't require it
  }

  // Validate city ID - only required for creation
  if ('cityId' in data) {
    if (data.cityId !== undefined && data.cityId !== null && data.cityId <= 0) {
      errors.push('La ciudad debe ser un ID válido');
    }
    // For updates, cityId is optional
  }

  // Validate zone type - only validate if provided
  if ('zoneType' in data && data.zoneType !== undefined && data.zoneType !== null) {
    const validTypes = ['regular', 'premium', 'restricted'];
    if (!validTypes.includes(data.zoneType)) {
      errors.push('Tipo de zona inválido');
    }
  }
  
  // Validate boundaries
  if ('boundaries' in data && data.boundaries) {
    const geoValidation = validateGeoJSONPolygon(data.boundaries);
    if (!geoValidation.isValid) {
      errors.push(...geoValidation.errors);
    }
  }
  
  // Validate coordinates
  if ('centerLat' in data && data.centerLat !== undefined) {
    if (data.centerLat < -90 || data.centerLat > 90) {
      errors.push('Latitud debe estar entre -90 y 90');
    }
  }
  
  if ('centerLng' in data && data.centerLng !== undefined) {
    if (data.centerLng < -180 || data.centerLng > 180) {
      errors.push('Longitud debe estar entre -180 y 180');
    }
  }
  
  // Validate pricing multiplier
  if ('pricingMultiplier' in data && data.pricingMultiplier !== undefined) {
    if (data.pricingMultiplier < 0.5 || data.pricingMultiplier > 10) {
      errors.push('Multiplicador de pricing debe estar entre 0.5 y 10');
    }
  }
  
  // Validate demand multiplier
  if ('demandMultiplier' in data && data.demandMultiplier !== undefined) {
    if (data.demandMultiplier < 0.5 || data.demandMultiplier > 10) {
      errors.push('Multiplicador de demanda debe estar entre 0.5 y 10');
    }
  }
  
  // Validate driver limits
  if ('maxDrivers' in data && data.maxDrivers !== undefined) {
    if (data.maxDrivers <= 0) {
      errors.push('Máximo conductores debe ser mayor a 0');
    }
  }
  
  if ('minDrivers' in data && data.minDrivers !== undefined) {
    if (data.minDrivers < 0) {
      errors.push('Mínimo conductores debe ser 0 o mayor');
    }
  }
  
  // Validate driver limits relationship
  if ('maxDrivers' in data && 'minDrivers' in data && 
      data.maxDrivers !== undefined && data.minDrivers !== undefined) {
    if (data.minDrivers > data.maxDrivers) {
      errors.push('Mínimo conductores no puede ser mayor al máximo');
    }
  }
  
  // Validate peak hours
  if ('peakHours' in data && data.peakHours) {
    const peakHoursErrors = validatePeakHours(data.peakHours);
    errors.push(...peakHoursErrors);
  }
  
  return errors;
}

/**
 * Validate peak hours format
 */
export function validatePeakHours(peakHours: { weekdays: string[]; weekends: string[] }): string[] {
  const errors: string[] = [];
  
  // Validate weekdays
  if (peakHours.weekdays && Array.isArray(peakHours.weekdays)) {
    peakHours.weekdays.forEach((timeRange, index) => {
      if (!isValidTimeRange(timeRange)) {
        errors.push(`Horario de día de semana ${index + 1} tiene formato inválido: ${timeRange}`);
      }
    });
  }
  
  // Validate weekends
  if (peakHours.weekends && Array.isArray(peakHours.weekends)) {
    peakHours.weekends.forEach((timeRange, index) => {
      if (!isValidTimeRange(timeRange)) {
        errors.push(`Horario de fin de semana ${index + 1} tiene formato inválido: ${timeRange}`);
      }
    });
  }
  
  return errors;
}

/**
 * Validate time range format (HH:MM-HH:MM)
 */
export function isValidTimeRange(timeRange: string): boolean {
  const timeRangeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRangeRegex.test(timeRange);
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 0) {
    return '';
  }
  
  if (errors.length === 1) {
    return errors[0];
  }
  
  return `Se encontraron ${errors.length} errores:\n• ${errors.join('\n• ')}`;
}

/**
 * Check if polygon overlaps with existing zones
 */
export function checkPolygonOverlap(
  polygon: any, 
  existingZones: Array<{ boundaries: any; id?: number }>,
  excludeZoneId?: number
): { hasOverlap: boolean; overlappingZones: number[] } {
  const overlappingZones: number[] = [];
  
  existingZones.forEach(zone => {
    // Skip the zone being edited
    if (excludeZoneId && zone.id === excludeZoneId) {
      return;
    }
    
    // Simple bounding box check for performance
    if (checkBoundingBoxOverlap(polygon, zone.boundaries)) {
      if (zone.id) {
        overlappingZones.push(zone.id);
      }
    }
  });
  
  return {
    hasOverlap: overlappingZones.length > 0,
    overlappingZones
  };
}

/**
 * Check if two polygons' bounding boxes overlap
 */
export function checkBoundingBoxOverlap(polygon1: any, polygon2: any): boolean {
  const getBounds = (polygon: any) => {
    const coords = polygon.coordinates[0];
    let minLat = coords[0][1];
    let maxLat = coords[0][1];
    let minLng = coords[0][0];
    let maxLng = coords[0][0];
    
    coords.forEach((coord: number[]) => {
      minLat = Math.min(minLat, coord[1]);
      maxLat = Math.max(maxLat, coord[1]);
      minLng = Math.min(minLng, coord[0]);
      maxLng = Math.max(maxLng, coord[0]);
    });
    
    return { minLat, maxLat, minLng, maxLng };
  };
  
  const bounds1 = getBounds(polygon1);
  const bounds2 = getBounds(polygon2);
  
  return !(
    bounds1.maxLat < bounds2.minLat ||
    bounds1.minLat > bounds2.maxLat ||
    bounds1.maxLng < bounds2.minLng ||
    bounds1.minLng > bounds2.maxLng
  );
}

/**
 * Validate zone name uniqueness within city
 */
export function validateZoneNameUniqueness(
  name: string,
  cityId: number,
  existingZones: Array<{ name: string; cityId: number; id?: number }>,
  excludeZoneId?: number
): boolean {
  return !existingZones.some(zone => 
    zone.name.toLowerCase() === name.toLowerCase() &&
    zone.cityId === cityId &&
    zone.id !== excludeZoneId
  );
}

/**
 * Get validation warnings for zone configuration
 */
export function getZoneConfigurationWarnings(data: CreateServiceZoneInput | UpdateServiceZoneInput): string[] {
  const warnings: string[] = [];
  
  // Warning for very high pricing
  if ('pricingMultiplier' in data && data.pricingMultiplier && data.pricingMultiplier > 3.0) {
    warnings.push('Multiplicador de pricing muy alto puede reducir la demanda significativamente');
  }
  
  // Warning for very low pricing
  if ('pricingMultiplier' in data && data.pricingMultiplier && data.pricingMultiplier < 0.7) {
    warnings.push('Multiplicador de pricing muy bajo puede afectar la rentabilidad');
  }
  
  // Warning for high demand multiplier
  if ('demandMultiplier' in data && data.demandMultiplier && data.demandMultiplier > 2.5) {
    warnings.push('Multiplicador de demanda muy alto puede indicar sobrecarga');
  }
  
  // Warning for driver limits
  if ('maxDrivers' in data && 'minDrivers' in data && 
      data.maxDrivers && data.minDrivers && 
      data.maxDrivers - data.minDrivers < 5) {
    warnings.push('Rango de conductores muy pequeño puede causar problemas operativos');
  }
  
  // Warning for premium zones without peak hours
  if ('zoneType' in data && data.zoneType === 'premium' && 
      (!('peakHours' in data) || !data.peakHours)) {
    warnings.push('Zonas premium deberían tener horarios pico configurados');
  }
  
  return warnings;
}

/**
 * Validate zone area constraints
 */
export function validateZoneArea(polygon: any): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // Calculate approximate area (simplified)
  const coords = polygon.coordinates[0];
  let area = 0;
  
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    area += (p2[0] - p1[0]) * (p2[1] + p1[1]);
  }
  
  area = Math.abs(area) / 2;
  
  // Convert to approximate square kilometers (rough estimation)
  const areaKm2 = area * 111 * 111; // Very rough conversion
  
  if (areaKm2 < 0.1) {
    warnings.push('Zona muy pequeña, puede ser difícil de gestionar');
  }
  
  if (areaKm2 > 100) {
    warnings.push('Zona muy grande, puede ser difícil de cubrir eficientemente');
  }
  
  return {
    isValid: true,
    warnings
  };
}

/**
 * Get comprehensive validation result
 */
export function getComprehensiveValidation(
  data: CreateServiceZoneInput | UpdateServiceZoneInput | Partial<CreateServiceZoneInput> | Partial<UpdateServiceZoneInput>,
  existingZones: Array<{ boundaries: any; name: string; cityId: number; id?: number }> = [],
  excludeZoneId?: number
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors = validateZoneData(data);
  const warnings = getZoneConfigurationWarnings(data);
  
  // Check for overlaps
  if ('boundaries' in data && data.boundaries) {
    const overlapCheck = checkPolygonOverlap(data.boundaries, existingZones, excludeZoneId);
    if (overlapCheck.hasOverlap) {
      warnings.push(`Zona se solapa con ${overlapCheck.overlappingZones.length} zona(s) existente(s)`);
    }
  }
  
  // Check name uniqueness
  if ('name' in data && 'cityId' in data && data.name && data.cityId) {
    if (!validateZoneNameUniqueness(data.name, data.cityId, existingZones, excludeZoneId)) {
      errors.push('Ya existe una zona con este nombre en la ciudad');
    }
  }
  
  // Check area constraints
  if ('boundaries' in data && data.boundaries) {
    const areaValidation = validateZoneArea(data.boundaries);
    warnings.push(...areaValidation.warnings);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

