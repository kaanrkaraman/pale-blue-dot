import { AU_KM } from "../core/data";

export function formatDistance(km: number): string {
  const abs = Math.abs(km);
  if (abs >= AU_KM * 0.1) {
    return `${(km / AU_KM).toFixed(2)} AU`;
  }
  if (abs >= 1_000_000) {
    return `${(km / 1_000_000).toFixed(2)} M km`;
  }
  if (abs >= 1_000) {
    return `${(km / 1_000).toFixed(1)} K km`;
  }
  return `${km.toFixed(0)} km`;
}

export function formatScaleBar(km: number): string {
  const abs = Math.abs(km);
  if (abs >= AU_KM) {
    return `${(km / AU_KM).toFixed(1)} AU`;
  }
  if (abs >= 1_000_000) {
    return `${(km / 1_000_000).toFixed(1)} M km`;
  }
  if (abs >= 1_000) {
    return `${Math.round(km / 1_000).toLocaleString()} K km`;
  }
  return `${Math.round(km).toLocaleString()} km`;
}

export function formatSpeed(daysPerSec: number): string {
  const abs = Math.abs(daysPerSec);
  if (abs >= 365.25) {
    return `${(daysPerSec / 365.25).toFixed(1)} yr/s`;
  }
  if (abs >= 1) {
    return `${daysPerSec.toFixed(1)} d/s`;
  }
  if (abs >= 1 / 24) {
    return `${(daysPerSec * 24).toFixed(1)} hr/s`;
  }
  return `${(daysPerSec * 86400).toFixed(0)} s/s`;
}

export function formatSimDate(daysSinceJ2000: number): string {
  // J2000 = 2000-01-01T12:00:00 UTC
  const j2000Ms = Date.UTC(2000, 0, 1, 12, 0, 0);
  const date = new Date(j2000Ms + daysSinceJ2000 * 86_400_000);
  return date.toISOString().slice(0, 10);
}

export function formatMass(kg: number): string {
  const exp = Math.floor(Math.log10(kg));
  const mantissa = kg / 10 ** exp;
  return `${mantissa.toFixed(2)} × 10^${exp} kg`;
}

export function formatPeriod(days: number): string {
  if (days >= 365.25 * 2) {
    return `${(days / 365.25).toFixed(2)} years`;
  }
  if (days >= 1) {
    return `${days.toFixed(2)} days`;
  }
  return `${(days * 24).toFixed(2)} hours`;
}

export function formatDegrees(radians: number): string {
  let deg = (radians * 180) / Math.PI;
  deg = ((deg % 360) + 360) % 360;
  return `${deg.toFixed(2)}°`;
}
