// Zone colors and styling utilities

export type ZoneType = 'regular' | 'premium' | 'restricted';

/**
 * Convert ZoneType enum from GeographyInterfaces to zone-colors ZoneType
 */
export function convertZoneTypeEnum(zoneType: import('@/interfaces/GeographyInterfaces').ZoneType): ZoneType {
  switch (zoneType) {
    case 'REGULAR':
      return 'regular';
    case 'PREMIUM':
      return 'premium';
    case 'RESTRICTED':
      return 'restricted';
    default:
      return 'regular'; // fallback
  }
}

/**
 * Get stroke color for zone type
 */
export function getZoneColor(zoneType: ZoneType): string {
  switch (zoneType) {
    case 'premium':
      return '#ff6b35'; // Orange for premium zones
    case 'restricted':
      return '#dc3545'; // Red for restricted zones
    case 'regular':
    default:
      return '#28a745'; // Green for regular zones
  }
}

/**
 * Get fill color for zone type
 */
export function getZoneFillColor(zoneType: ZoneType): string {
  switch (zoneType) {
    case 'premium':
      return '#ff6b35';
    case 'restricted':
      return '#dc3545';
    case 'regular':
    default:
      return '#28a745';
  }
}

/**
 * Get opacity based on zone status
 */
export function getZoneOpacity(isActive: boolean): number {
  return isActive ? 0.3 : 0.1;
}

/**
 * Get stroke weight based on zone type
 */
export function getZoneStrokeWeight(zoneType: ZoneType): number {
  switch (zoneType) {
    case 'premium':
      return 3; // Thicker line for premium
    case 'restricted':
      return 2; // Medium line for restricted
    case 'regular':
    default:
      return 2; // Standard line for regular
  }
}

/**
 * Get complete zone style object for Google Maps
 */
export function getZoneStyle(zoneType: ZoneType, isActive: boolean): google.maps.PolygonOptions {
  return {
    strokeColor: getZoneColor(zoneType),
    strokeOpacity: 0.8,
    strokeWeight: getZoneStrokeWeight(zoneType),
    fillColor: getZoneFillColor(zoneType),
    fillOpacity: getZoneOpacity(isActive),
    clickable: true,
    editable: false,
    zIndex: 1,
  };
}

/**
 * Get zone type label in Spanish
 */
export function getZoneTypeLabel(zoneType: ZoneType): string {
  switch (zoneType) {
    case 'premium':
      return 'Premium';
    case 'restricted':
      return 'Restringida';
    case 'regular':
    default:
      return 'Regular';
  }
}

/**
 * Get zone type description in Spanish
 */
export function getZoneTypeDescription(zoneType: ZoneType): string {
  switch (zoneType) {
    case 'premium':
      return 'Zona de alta demanda con pricing premium';
    case 'restricted':
      return 'Zona con restricciones de acceso o operación';
    case 'regular':
    default:
      return 'Zona estándar con pricing normal';
  }
}

/**
 * Get zone status label in Spanish
 */
export function getZoneStatusLabel(isActive: boolean): string {
  return isActive ? 'Activa' : 'Inactiva';
}

/**
 * Get zone status color
 */
export function getZoneStatusColor(isActive: boolean): string {
  return isActive ? '#28a745' : '#6c757d';
}

/**
 * Get zone status badge variant
 */
export function getZoneStatusBadgeVariant(isActive: boolean): 'default' | 'secondary' {
  return isActive ? 'default' : 'secondary';
}

/**
 * Get pricing multiplier color based on value
 */
export function getPricingMultiplierColor(multiplier: number): string {
  if (multiplier >= 2.0) {
    return '#dc3545'; // Red for very high pricing
  } else if (multiplier >= 1.5) {
    return '#ff6b35'; // Orange for high pricing
  } else if (multiplier >= 1.2) {
    return '#ffc107'; // Yellow for moderate pricing
  } else if (multiplier <= 0.8) {
    return '#17a2b8'; // Blue for low pricing
  } else {
    return '#28a745'; // Green for normal pricing
  }
}

/**
 * Get demand multiplier color based on value
 */
export function getDemandMultiplierColor(multiplier: number): string {
  if (multiplier >= 2.0) {
    return '#dc3545'; // Red for very high demand
  } else if (multiplier >= 1.5) {
    return '#ff6b35'; // Orange for high demand
  } else if (multiplier >= 1.2) {
    return '#ffc107'; // Yellow for moderate demand
  } else if (multiplier <= 0.8) {
    return '#17a2b8'; // Blue for low demand
  } else {
    return '#28a745'; // Green for normal demand
  }
}

/**
 * Get zone icon based on type
 */
export function getZoneIcon(zoneType: ZoneType): string {
  switch (zoneType) {
    case 'premium':
      return '⭐'; // Star for premium
    case 'restricted':
      return '🚫'; // Prohibition for restricted
    case 'regular':
    default:
      return '📍'; // Pin for regular
  }
}

/**
 * Get zone priority for rendering (higher number = render on top)
 */
export function getZoneRenderPriority(zoneType: ZoneType): number {
  switch (zoneType) {
    case 'restricted':
      return 3; // Highest priority
    case 'premium':
      return 2; // Medium priority
    case 'regular':
    default:
      return 1; // Lowest priority
  }
}

/**
 * Get zone legend item
 */
export function getZoneLegendItem(zoneType: ZoneType) {
  return {
    type: zoneType,
    label: getZoneTypeLabel(zoneType),
    description: getZoneTypeDescription(zoneType),
    color: getZoneColor(zoneType),
    fillColor: getZoneFillColor(zoneType),
    icon: getZoneIcon(zoneType),
  };
}

/**
 * Get all zone legend items
 */
export function getAllZoneLegendItems() {
  return [
    getZoneLegendItem('regular'),
    getZoneLegendItem('premium'),
    getZoneLegendItem('restricted'),
  ];
}
