// GeoJSON utilities for Service Zones
import type { GeoJSONPolygon } from '@/interfaces/GeographyInterfaces';

/**
 * Calculate the center point of a GeoJSON polygon
 */
export function calculatePolygonCenter(polygon: GeoJSONPolygon): { lat: number; lng: number } {
  const coordinates = polygon.coordinates[0];
  let latSum = 0;
  let lngSum = 0;
  
  coordinates.forEach((coord: number[]) => {
    lngSum += coord[0];
    latSum += coord[1];
  });
  
  return {
    lat: latSum / coordinates.length,
    lng: lngSum / coordinates.length
  };
}

/**
 * Convert Google Maps Polygon to GeoJSON format
 */
export function googleMapsPolygonToGeoJSON(polygon: google.maps.Polygon): GeoJSONPolygon {
  const path = polygon.getPath();
  const coordinates = [];
  
  for (let i = 0; i < path.getLength(); i++) {
    const point = path.getAt(i);
    coordinates.push([point.lng(), point.lat()]);
  }
  
  // Close the polygon
  coordinates.push(coordinates[0]);
  
  return {
    type: 'Polygon',
    coordinates: [coordinates]
  };
}

/**
 * Convert GeoJSON to Google Maps Polygon path
 */
export function geoJSONToGoogleMapsPolygon(geojson: GeoJSONPolygon): google.maps.LatLng[] {
  return geojson.coordinates[0].map(coord => 
    new google.maps.LatLng(coord[1], coord[0])
  );
}

/**
 * Validate GeoJSON Polygon structure
 */
export function validateGeoJSONPolygon(polygon: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!polygon) {
    errors.push('Polygon is required');
    return { isValid: false, errors };
  }
  
  if (polygon.type !== 'Polygon') {
    errors.push('Polygon type must be "Polygon"');
  }
  
  if (!polygon.coordinates || !Array.isArray(polygon.coordinates)) {
    errors.push('Polygon must have coordinates array');
    return { isValid: false, errors };
  }
  
  if (polygon.coordinates.length === 0) {
    errors.push('Polygon coordinates cannot be empty');
    return { isValid: false, errors };
  }
  
  const ring = polygon.coordinates[0];
  if (!Array.isArray(ring) || ring.length < 4) {
    errors.push('Polygon must have at least 4 coordinate points');
    return { isValid: false, errors };
  }
  
  // Check if polygon is closed (first and last points should be the same)
  const firstPoint = ring[0];
  const lastPoint = ring[ring.length - 1];
  if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
    errors.push('Polygon must be closed (first and last points must be the same)');
  }
  
  // Validate coordinate format
  for (let i = 0; i < ring.length; i++) {
    const coord = ring[i];
    if (!Array.isArray(coord) || coord.length !== 2) {
      errors.push(`Coordinate at index ${i} must be an array of [lng, lat]`);
      continue;
    }
    
    const [lng, lat] = coord;
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      errors.push(`Coordinate at index ${i} must have numeric longitude and latitude`);
      continue;
    }
    
    if (lng < -180 || lng > 180) {
      errors.push(`Longitude at index ${i} must be between -180 and 180`);
    }
    
    if (lat < -90 || lat > 90) {
      errors.push(`Latitude at index ${i} must be between -90 and 90`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate approximate area of a polygon in square kilometers
 * Uses the spherical excess formula for small areas
 */
export function calculatePolygonArea(polygon: GeoJSONPolygon): number {
  const coordinates = polygon.coordinates[0];
  const R = 6371; // Earth's radius in kilometers
  let area = 0;
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[i + 1];
    
    const lat1 = (p1[1] * Math.PI) / 180;
    const lng1 = (p1[0] * Math.PI) / 180;
    const lat2 = (p2[1] * Math.PI) / 180;
    const lng2 = (p2[0] * Math.PI) / 180;
    
    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  
  area = Math.abs(area * R * R / 2);
  return area;
}

/**
 * Check if two polygons overlap
 * Simple bounding box check for performance
 */
export function checkPolygonOverlap(polygon1: GeoJSONPolygon, polygon2: GeoJSONPolygon): boolean {
  const getBounds = (polygon: GeoJSONPolygon) => {
    const coords = polygon.coordinates[0];
    let minLat = coords[0][1];
    let maxLat = coords[0][1];
    let minLng = coords[0][0];
    let maxLng = coords[0][0];
    
    coords.forEach(coord => {
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
 * Simplify polygon by removing redundant points
 * Removes points that are too close to each other
 */
export function simplifyPolygon(polygon: GeoJSONPolygon, tolerance: number = 0.0001): GeoJSONPolygon {
  const coordinates = polygon.coordinates[0];
  const simplified: number[][] = [];
  
  for (let i = 0; i < coordinates.length; i++) {
    const current = coordinates[i];
    const next = coordinates[(i + 1) % coordinates.length];
    
    const distance = Math.sqrt(
      Math.pow(current[0] - next[0], 2) + Math.pow(current[1] - next[1], 2)
    );
    
    if (distance > tolerance) {
      simplified.push(current);
    }
  }
  
  // Ensure polygon is closed
  if (simplified.length > 0) {
    const first = simplified[0];
    const last = simplified[simplified.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      simplified.push([first[0], first[1]]);
    }
  }
  
  return {
    type: 'Polygon',
    coordinates: [simplified]
  };
}

/**
 * Get polygon bounds for map fitting
 */
export function getPolygonBounds(polygon: GeoJSONPolygon): google.maps.LatLngBounds {
  const coords = polygon.coordinates[0];
  const bounds = new google.maps.LatLngBounds();
  
  coords.forEach(coord => {
    bounds.extend(new google.maps.LatLng(coord[1], coord[0]));
  });
  
  return bounds;
}

/**
 * Check if a point is inside a polygon
 * Uses ray casting algorithm
 */
export function isPointInPolygon(point: { lat: number; lng: number }, polygon: GeoJSONPolygon): boolean {
  const { lat, lng } = point;
  const coords = polygon.coordinates[0];
  let inside = false;
  
  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const xi = coords[i][0];
    const yi = coords[i][1];
    const xj = coords[j][0];
    const yj = coords[j][1];
    
    if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}
