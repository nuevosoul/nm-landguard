// Shared validation utilities for edge functions

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Validate latitude (-90 to 90)
export function validateLatitude(lat: unknown): ValidationResult {
  if (lat === undefined || lat === null) {
    return { valid: false, error: "Latitude is required" };
  }
  const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
  if (typeof latNum !== 'number' || isNaN(latNum)) {
    return { valid: false, error: "Latitude must be a valid number" };
  }
  if (latNum < -90 || latNum > 90) {
    return { valid: false, error: "Latitude must be between -90 and 90" };
  }
  return { valid: true };
}

// Validate longitude (-180 to 180)
export function validateLongitude(lng: unknown): ValidationResult {
  if (lng === undefined || lng === null) {
    return { valid: false, error: "Longitude is required" };
  }
  const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
  if (typeof lngNum !== 'number' || isNaN(lngNum)) {
    return { valid: false, error: "Longitude must be a valid number" };
  }
  if (lngNum < -180 || lngNum > 180) {
    return { valid: false, error: "Longitude must be between -180 and 180" };
  }
  return { valid: true };
}

// Validate both coordinates at once
export function validateCoordinates(lat: unknown, lng: unknown): ValidationResult {
  const latResult = validateLatitude(lat);
  if (!latResult.valid) return latResult;
  
  const lngResult = validateLongitude(lng);
  if (!lngResult.valid) return lngResult;
  
  return { valid: true };
}

// Validate radius in miles (0.1 to 100)
export function validateRadius(radius: unknown, defaultValue: number = 5, maxValue: number = 100): { valid: boolean; value: number; error?: string } {
  if (radius === undefined || radius === null) {
    return { valid: true, value: defaultValue };
  }
  const radiusNum = typeof radius === 'string' ? parseFloat(radius) : radius;
  if (typeof radiusNum !== 'number' || isNaN(radiusNum)) {
    return { valid: false, value: defaultValue, error: "Radius must be a valid number" };
  }
  if (radiusNum < 0.1 || radiusNum > maxValue) {
    return { valid: false, value: defaultValue, error: `Radius must be between 0.1 and ${maxValue} miles` };
  }
  return { valid: true, value: radiusNum };
}

// Validate string input (length limits, basic sanitization)
export function validateString(input: unknown, maxLength: number = 500, minLength: number = 0): { valid: boolean; value: string; error?: string } {
  if (input === undefined || input === null) {
    if (minLength > 0) {
      return { valid: false, value: "", error: "Input is required" };
    }
    return { valid: true, value: "" };
  }
  if (typeof input !== 'string') {
    return { valid: false, value: "", error: "Input must be a string" };
  }
  const trimmed = input.trim();
  if (trimmed.length < minLength) {
    return { valid: false, value: "", error: `Input must be at least ${minLength} characters` };
  }
  if (trimmed.length > maxLength) {
    return { valid: false, value: "", error: `Input must not exceed ${maxLength} characters` };
  }
  return { valid: true, value: trimmed };
}

// Validate zoom level for maps (1 to 21)
export function validateZoom(zoom: unknown, defaultValue: number = 18): { valid: boolean; value: number; error?: string } {
  if (zoom === undefined || zoom === null) {
    return { valid: true, value: defaultValue };
  }
  const zoomNum = typeof zoom === 'string' ? parseInt(zoom, 10) : zoom;
  if (typeof zoomNum !== 'number' || isNaN(zoomNum) || !Number.isInteger(zoomNum)) {
    return { valid: false, value: defaultValue, error: "Zoom must be a valid integer" };
  }
  if (zoomNum < 1 || zoomNum > 21) {
    return { valid: false, value: defaultValue, error: "Zoom must be between 1 and 21" };
  }
  return { valid: true, value: zoomNum };
}

// Validate map dimensions (width/height in pixels)
export function validateDimension(dim: unknown, defaultValue: number = 640, maxValue: number = 1280): { valid: boolean; value: number; error?: string } {
  if (dim === undefined || dim === null) {
    return { valid: true, value: defaultValue };
  }
  const dimNum = typeof dim === 'string' ? parseInt(dim, 10) : dim;
  if (typeof dimNum !== 'number' || isNaN(dimNum) || !Number.isInteger(dimNum)) {
    return { valid: false, value: defaultValue, error: "Dimension must be a valid integer" };
  }
  if (dimNum < 64 || dimNum > maxValue) {
    return { valid: false, value: defaultValue, error: `Dimension must be between 64 and ${maxValue} pixels` };
  }
  return { valid: true, value: dimNum };
}

// Validate address string for geocoding
export function validateAddress(address: unknown): { valid: boolean; value: string; error?: string } {
  if (address === undefined || address === null || address === '') {
    return { valid: false, value: "", error: "Address is required" };
  }
  if (typeof address !== 'string') {
    return { valid: false, value: "", error: "Address must be a string" };
  }
  const trimmed = address.trim();
  if (trimmed.length < 3) {
    return { valid: false, value: "", error: "Address must be at least 3 characters" };
  }
  if (trimmed.length > 500) {
    return { valid: false, value: "", error: "Address must not exceed 500 characters" };
  }
  // Basic sanitization - remove potential SQL/script injection patterns
  // Note: We're just checking for obvious patterns, not full sanitization
  if (/<script|javascript:|data:/i.test(trimmed)) {
    return { valid: false, value: "", error: "Invalid characters in address" };
  }
  return { valid: true, value: trimmed };
}

// Validate autocomplete query
export function validateQuery(query: unknown, minLength: number = 3): { valid: boolean; value: string; error?: string } {
  if (query === undefined || query === null || query === '') {
    return { valid: false, value: "", error: "Query is required" };
  }
  if (typeof query !== 'string') {
    return { valid: false, value: "", error: "Query must be a string" };
  }
  const trimmed = query.trim();
  if (trimmed.length < minLength) {
    return { valid: false, value: "", error: `Query must be at least ${minLength} characters` };
  }
  if (trimmed.length > 200) {
    return { valid: false, value: "", error: "Query must not exceed 200 characters" };
  }
  // Basic sanitization
  if (/<script|javascript:|data:/i.test(trimmed)) {
    return { valid: false, value: "", error: "Invalid characters in query" };
  }
  return { valid: true, value: trimmed };
}
