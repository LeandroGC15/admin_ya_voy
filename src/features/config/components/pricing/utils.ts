import type { CreateTemporalPricingRuleInput, UpdateTemporalPricingRuleInput } from '../../schemas/pricing.schemas';

/**
 * Utilidad para preparar datos de formulario para crear una regla temporal de pricing
 * Asegura que todos los campos requeridos estén presentes y maneja valores por defecto
 */
export function prepareCreateTemporalRuleData(data: CreateTemporalPricingRuleInput): CreateTemporalPricingRuleInput {
  return {
    name: data.name,
    description: data.description || '', // Convertir undefined a string vacío
    ruleType: data.ruleType,
    multiplier: data.multiplier,
    startTime: data.startTime,
    endTime: data.endTime,
    daysOfWeek: data.daysOfWeek || [],
    specificDates: data.specificDates || [],
    dateRanges: data.dateRanges || [],
    isActive: data.isActive ?? true, // Default a true si no está definido
    priority: data.priority ?? 10, // Default a 10 si no está definido
    countryId: data.countryId,
    stateId: data.stateId,
    cityId: data.cityId,
    zoneId: data.zoneId,
  };
}

/**
 os opcionales se incluyen si tienen valores válidos, permitiendo combinaciones
 */
export function prepareUpdateTemporalRuleData(
  formData: any,
  originalRuleType: string
): UpdateTemporalPricingRuleInput {
  // Determinar el ruleType principal basado en las condiciones activas
  let primaryRuleType = originalRuleType;

  // Si hay startTime y endTime, usar time_range
  if (formData.startTime && formData.endTime) {
    primaryRuleType = 'time_range';
  }
  // Si hay daysOfWeek, usar day_of_week
  else if (formData.daysOfWeek?.length > 0) {
    primaryRuleType = 'day_of_week';
  }
  // Si hay specificDates, usar date_specific
  else if (formData.specificDates?.length > 0) {
    primaryRuleType = 'date_specific';
  }
  // Si hay dateRanges, usar seasonal
  else if (formData.dateRanges?.length > 0) {
    primaryRuleType = 'seasonal';
  }

  return {
    ruleType: primaryRuleType as any, // Siempre requerido según el schema
    name: formData.name || undefined,
    description: formData.description || undefined,
    multiplier: formData.multiplier,
    startTime: formData.startTime || undefined,
    endTime: formData.endTime || undefined,
    daysOfWeek: formData.daysOfWeek?.length ? formData.daysOfWeek : undefined,
    specificDates: formData.specificDates?.length ? formData.specificDates : undefined,
    dateRanges: formData.dateRanges?.length ? formData.dateRanges : undefined,
    isActive: formData.isActive,
    priority: formData.priority,
    countryId: formData.countryId || undefined,
    stateId: formData.stateId || undefined,
    cityId: formData.cityId || undefined,
    zoneId: formData.zoneId || undefined,
  };
}
