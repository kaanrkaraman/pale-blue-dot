import {
  ASTEROID_BELT_INNER_KM,
  ASTEROID_BELT_OUTER_KM,
  AU_KM,
  HELIOPAUSE_KM,
  HELIOSPHERE_NOSE_LONGITUDE_DEG,
  JUPITER_RING_INNER_KM,
  JUPITER_RING_OUTER_KM,
  KUIPER_BELT_INNER_KM,
  KUIPER_BELT_OUTER_KM,
  OORT_CLOUD_INNER_KM,
  OORT_CLOUD_OUTER_KM,
  SATURN_RING_INNER_KM,
  SATURN_RING_OUTER_KM,
  TERMINATION_SHOCK_KM,
} from "../core/data";
import type { BodyState, CameraState, CelestialBodyData } from "../core/types";
import { worldToScreen } from "./camera";
import { computeTrailPointsCached, drawTrail, isOrbitVisible } from "./orbit";

const MIN_PLANET_SIZE = 4;
const MIN_MOON_SIZE = 2.5;
const MIN_SUN_SIZE = 8;
const MIN_PROBE_SIZE = 3;

const BG_COLOR = "#0a0a12";
const BG_BLACK = "#000000";

const TRAIL_PLANET_RGB = { r: 80, g: 110, b: 180 };
const TRAIL_MOON_RGB = { r: 130, g: 160, b: 210 };
const TRAIL_PROBE_RGB = { r: 50, g: 180, b: 130 };

// ===== Starfield =====

interface StarPoint {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  brightness: number;
  size: number;
}

interface NebulaPatch {
  x: number;
  y: number;
  radius: number;
  r: number;
  g: number;
  b: number;
  alpha: number;
}

let cachedStars: StarPoint[] | null = null;
let cachedNebulae: NebulaPatch[] | null = null;
let cachedStarDimensions = { w: 0, h: 0 };

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateStarfield(width: number, height: number): { stars: StarPoint[]; nebulae: NebulaPatch[] } {
  if (cachedStars && cachedNebulae && cachedStarDimensions.w === width && cachedStarDimensions.h === height) {
    return { stars: cachedStars, nebulae: cachedNebulae };
  }

  const rand = seededRandom(42);
  const stars: StarPoint[] = [];
  const count = Math.floor((width * height) / 400);

  const colors = [
    { r: 200, g: 210, b: 255, weight: 0.7 }, // blue-white
    { r: 255, g: 240, b: 200, weight: 0.15 }, // yellow-white
    { r: 255, g: 200, b: 150, weight: 0.1 }, // warm orange
    { r: 255, g: 255, b: 255, weight: 0.05 }, // pure bright white
  ];

  for (let i = 0; i < count; i++) {
    const roll = rand();
    let cumulative = 0;
    let color = colors[0];
    for (const c of colors) {
      cumulative += c.weight;
      if (roll <= cumulative) {
        color = c;
        break;
      }
    }

    const sizeRoll = rand();
    let size: number;
    if (sizeRoll < 0.6)
      size = 0.5 + rand() * 0.5; // 60% tiny
    else if (sizeRoll < 0.9)
      size = 1.0 + rand() * 0.5; // 30% medium
    else if (sizeRoll < 0.98)
      size = 1.5 + rand() * 0.5; // 8% larger
    else size = 2.0 + rand() * 1.0; // 2% bright

    const brightness = size > 2 ? 0.6 + rand() * 0.4 : 0.15 + rand() * 0.5;

    stars.push({
      x: rand() * width,
      y: rand() * height,
      r: color.r,
      g: color.g,
      b: color.b,
      brightness,
      size,
    });
  }

  const nebulaColors = [
    { r: 80, g: 50, b: 140 }, // deep purple
    { r: 40, g: 80, b: 150 }, // blue
    { r: 50, g: 120, b: 110 }, // teal
    { r: 100, g: 50, b: 80 }, // mauve
    { r: 30, g: 60, b: 100 }, // dark blue
  ];

  const nebulae: NebulaPatch[] = [];
  const nebulaCount = 3 + Math.floor(rand() * 3);
  for (let i = 0; i < nebulaCount; i++) {
    const c = nebulaColors[Math.floor(rand() * nebulaColors.length)];
    nebulae.push({
      x: rand() * width,
      y: rand() * height,
      radius: 150 + rand() * 300,
      r: c.r,
      g: c.g,
      b: c.b,
      alpha: 0.015 + rand() * 0.02,
    });
  }

  cachedStars = stars;
  cachedNebulae = nebulae;
  cachedStarDimensions = { w: width, h: height };
  return { stars, nebulae };
}

function drawImmersiveBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, width, height);

  const { stars, nebulae } = generateStarfield(width, height);

  for (const neb of nebulae) {
    const gradient = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
    gradient.addColorStop(0, `rgba(${neb.r}, ${neb.g}, ${neb.b}, ${neb.alpha})`);
    gradient.addColorStop(0.5, `rgba(${neb.r}, ${neb.g}, ${neb.b}, ${neb.alpha * 0.4})`);
    gradient.addColorStop(1, `rgba(${neb.r}, ${neb.g}, ${neb.b}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(neb.x - neb.radius, neb.y - neb.radius, neb.radius * 2, neb.radius * 2);
  }

  for (const star of stars) {
    ctx.fillStyle = `rgba(${star.r}, ${star.g}, ${star.b}, ${star.brightness})`;
    if (star.size > 2) {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
      glow.addColorStop(0, `rgba(${star.r}, ${star.g}, ${star.b}, ${star.brightness * 0.3})`);
      glow.addColorStop(1, `rgba(${star.r}, ${star.g}, ${star.b}, 0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(star.x - star.size * 3, star.y - star.size * 3, star.size * 6, star.size * 6);
    } else {
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
  }
}

// ===== Body rendering helpers =====

function drawSunGlow(ctx: CanvasRenderingContext2D, sx: number, sy: number, radiusPx: number): void {
  const glowRadius = Math.max(radiusPx * 4, 20);
  const gradient = ctx.createRadialGradient(sx, sy, radiusPx * 0.5, sx, sy, glowRadius);
  gradient.addColorStop(0, "rgba(253, 184, 19, 0.4)");
  gradient.addColorStop(0.3, "rgba(253, 184, 19, 0.15)");
  gradient.addColorStop(0.7, "rgba(253, 140, 0, 0.05)");
  gradient.addColorStop(1, "rgba(253, 140, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(sx, sy, glowRadius, 0, Math.PI * 2);
  ctx.fill();
}

function drawSelectionIndicator(ctx: CanvasRenderingContext2D, sx: number, sy: number, radius: number): void {
  const indicatorRadius = radius + 6;
  ctx.beginPath();
  ctx.arc(sx, sy, indicatorRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(100, 150, 255, 0.7)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawDiamond(ctx: CanvasRenderingContext2D, sx: number, sy: number, size: number, color: string): void {
  ctx.beginPath();
  ctx.moveTo(sx, sy - size);
  ctx.lineTo(sx + size, sy);
  ctx.lineTo(sx, sy + size);
  ctx.lineTo(sx - size, sy);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function getDisplayRadius(body: CelestialBodyData, kmPerPixel: number, humanEyeScale: boolean): number {
  const realRadiusPx = body.radius / kmPerPixel;

  if (!humanEyeScale) return Math.max(realRadiusPx, 0.5);

  if (body.type === "star") return Math.max(realRadiusPx, MIN_SUN_SIZE);
  if (body.type === "moon") return Math.max(realRadiusPx, MIN_MOON_SIZE);
  if (body.type === "probe" || body.type === "comet") return Math.max(realRadiusPx, MIN_PROBE_SIZE);
  return Math.max(realRadiusPx, MIN_PLANET_SIZE);
}

const rgbCache = new Map<string, { r: number; g: number; b: number }>();
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cached = rgbCache.get(hex);
  if (cached) return cached;
  const h = hex.replace("#", "");
  cached = {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
  rgbCache.set(hex, cached);
  return cached;
}

// ===== Label collision system =====

const TYPE_PRIORITY: Record<string, number> = {
  star: 400,
  planet: 300,
  "dwarf-planet": 200,
  moon: 100,
  probe: 150,
};

interface LabelCandidate {
  bodyId: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  priority: number;
  isProbe: boolean;
}

function labelsOverlap(a: LabelCandidate, b: LabelCandidate): boolean {
  const pad = 4;
  const aLeft = a.x - pad;
  const aRight = a.x + a.width + pad;
  const aTop = a.y - a.height - pad;
  const aBottom = a.y + pad;

  const bLeft = b.x - pad;
  const bRight = b.x + b.width + pad;
  const bTop = b.y - b.height - pad;
  const bBottom = b.y + pad;

  return !(aRight < bLeft || bRight < aLeft || aBottom < bTop || bBottom < aTop);
}

function resolveLabels(
  ctx: CanvasRenderingContext2D,
  bodies: CelestialBodyData[],
  bodyStates: Map<string, BodyState>,
  camera: CameraState,
  width: number,
  height: number,
  humanEyeScale: boolean,
  selectedBodyId: string,
): LabelCandidate[] {
  const candidates: LabelCandidate[] = [];
  const font = "'JetBrains Mono', 'Fira Code', monospace";

  for (const body of bodies) {
    const state = bodyStates.get(body.id);
    if (!state) continue;

    const screen = worldToScreen(state.position, camera, width, height);
    if (screen.x < -50 || screen.x > width + 50 || screen.y < -50 || screen.y > height + 50) continue;

    if (body.type === "moon" && body.orbit) {
      if (camera.kmPerPixel > body.orbit.semiMajorAxis / 200) continue;
    }

    const radiusPx = getDisplayRadius(body, camera.kmPerPixel, humanEyeScale);
    const fontSize =
      body.type === "star" ? 12 : body.type === "moon" ? 9 : body.type === "probe" || body.type === "comet" ? 9 : 11;

    ctx.font = `${fontSize}px ${font}`;
    const textWidth = ctx.measureText(body.name).width;

    const labelX = screen.x + radiusPx + 4;
    const labelY = screen.y + fontSize / 3;

    const isSelected = body.id === selectedBodyId;
    const priority = (isSelected ? 10000 : 0) + (TYPE_PRIORITY[body.type] ?? 0) + Math.log10(body.radius + 1);

    candidates.push({
      bodyId: body.id,
      text: body.name,
      x: labelX,
      y: labelY,
      width: textWidth,
      height: fontSize,
      fontSize,
      priority,
      isProbe: body.type === "probe" || body.type === "comet",
    });
  }

  candidates.sort((a, b) => b.priority - a.priority);

  const placed: LabelCandidate[] = [];
  for (const c of candidates) {
    let overlaps = false;
    for (const p of placed) {
      if (labelsOverlap(c, p)) {
        overlaps = true;
        break;
      }
    }
    if (!overlaps) placed.push(c);
  }

  return placed;
}

// ===== Belt / boundary rendering =====

const DEG_TO_RAD = Math.PI / 180;

function drawBelt(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: CameraState,
  sunPosition: { x: number; y: number },
  innerRadiusKm: number,
  outerRadiusKm: number,
  fillColor: string,
  strokeColor: string,
  label: string,
  labelColor: string,
): void {
  const sunScreen = worldToScreen(sunPosition, camera, width, height);

  const innerPx = innerRadiusKm / camera.kmPerPixel;
  const outerPx = outerRadiusKm / camera.kmPerPixel;

  if (outerPx < 5 || innerPx > Math.max(width, height) * 50) return;

  ctx.save();
  ctx.beginPath();
  ctx.arc(sunScreen.x, sunScreen.y, outerPx, 0, Math.PI * 2);
  ctx.arc(sunScreen.x, sunScreen.y, innerPx, 0, Math.PI * 2, true);
  ctx.fillStyle = fillColor;
  ctx.fill();

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 0.8;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.arc(sunScreen.x, sunScreen.y, innerPx, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(sunScreen.x, sunScreen.y, outerPx, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  const labelRadiusPx = (innerRadiusKm + outerRadiusKm) / 2 / camera.kmPerPixel;
  const labelX = sunScreen.x;
  const labelY = sunScreen.y - labelRadiusPx;

  if (labelY > 0 && labelY < height && labelX > 0 && labelX < width) {
    ctx.font = "9px 'JetBrains Mono', 'Fira Code', monospace";
    ctx.fillStyle = labelColor;
    ctx.textAlign = "center";
    const innerAU = (innerRadiusKm / AU_KM).toFixed(1);
    const outerAU = (outerRadiusKm / AU_KM).toFixed(1);
    ctx.fillText(`${label} (${innerAU}–${outerAU} AU)`, labelX, labelY - 4);
  }
}

function drawPlanetaryRing(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  innerRadiusKm: number,
  outerRadiusKm: number,
  kmPerPixel: number,
  fillColor: string,
  strokeColor: string,
): void {
  const innerPx = innerRadiusKm / kmPerPixel;
  const outerPx = outerRadiusKm / kmPerPixel;

  if (outerPx < 2 || innerPx > 4000) return;

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerPx, 0, Math.PI * 2);
  ctx.arc(centerX, centerY, innerPx, 0, Math.PI * 2, true);
  ctx.fillStyle = fillColor;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(centerX, centerY, outerPx, 0, Math.PI * 2);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 0.6;
  ctx.stroke();
  ctx.restore();
}

function drawHeliosphere(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: CameraState,
  sunPosition: { x: number; y: number },
): void {
  const sunScreen = worldToScreen(sunPosition, camera, width, height);

  // Sun's motion through ISM at ~255° ecliptic longitude
  const noseAngle = HELIOSPHERE_NOSE_LONGITUDE_DEG * DEG_TO_RAD;

  const boundaries = [
    {
      label: "Termination Shock",
      noseRadius: TERMINATION_SHOCK_KM * 0.93, // ~84 AU on nose side (V2 crossed at 84)
      tailRadius: TERMINATION_SHOCK_KM * 1.07, // ~96 AU on tail side
      color: "rgba(100, 180, 255, 0.25)",
      labelColor: "rgba(100, 180, 255, 0.5)",
    },
    {
      label: "Heliopause",
      noseRadius: HELIOPAUSE_KM * 0.99, // ~119 AU on nose (V2 crossing)
      tailRadius: HELIOPAUSE_KM * 1.25, // ~150 AU on tail side
      color: "rgba(180, 120, 255, 0.25)",
      labelColor: "rgba(180, 120, 255, 0.5)",
    },
  ];

  for (const boundary of boundaries) {
    const a = (boundary.noseRadius + boundary.tailRadius) / 2;
    const c = (boundary.tailRadius - boundary.noseRadius) / 2;

    const aPx = a / camera.kmPerPixel;
    const cPx = c / camera.kmPerPixel;

    if (aPx < 10 || aPx > width * 80) continue;

    const tailAngle = noseAngle + Math.PI;
    const centerX = sunScreen.x + cPx * Math.cos(tailAngle);
    const centerY = sunScreen.y - cPx * Math.sin(tailAngle);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(-noseAngle); // screen Y is flipped

    const semiMajorPx = a / camera.kmPerPixel;
    const semiMinorPx = Math.sqrt(boundary.noseRadius * boundary.tailRadius) / camera.kmPerPixel;

    ctx.beginPath();
    ctx.ellipse(0, 0, semiMajorPx, semiMinorPx, 0, 0, Math.PI * 2);
    ctx.strokeStyle = boundary.color;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();

    const labelRadiusPx = (boundary.noseRadius * 0.99) / camera.kmPerPixel;
    const labelX = sunScreen.x;
    const labelY = sunScreen.y - labelRadiusPx - 8;

    if (labelY > 0 && labelY < height && labelX > 0 && labelX < width) {
      ctx.font = "9px 'JetBrains Mono', 'Fira Code', monospace";
      ctx.fillStyle = boundary.labelColor;
      ctx.textAlign = "center";
      const auLabel = `${boundary.label} (~${Math.round((boundary.noseRadius + boundary.tailRadius) / 2 / AU_KM)} AU)`;
      ctx.fillText(auLabel, labelX, labelY);
    }
  }
}

// ===== Main render =====

export function renderScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: CameraState,
  bodyStates: Map<string, BodyState>,
  bodies: CelestialBodyData[],
  selectedBodyId: string,
  humanEyeScale: boolean,
  simTime: number,
  immersiveBackground: boolean,
  maxOrbitRadius: number,
  showHeliosphere: boolean = false,
  showAsteroidBelt: boolean = false,
  showKuiperBelt: boolean = false,
  showSelectionIndicator: boolean = true,
  showFullOrbits: boolean = false,
  orbitPaths?: Map<string, import("../core/types").OrbitPath>,
  showOortCloud: boolean = false,
  showProbes: boolean = true,
  showDwarfPlanets: boolean = true,
  showComets: boolean = true,
): void {
  const visibleBodies = bodies.filter((b) => {
    if (b.type === "probe") return showProbes;
    if (b.type === "dwarf-planet") return showDwarfPlanets;
    if (b.type === "comet") return showComets;
    return true;
  });

  if (immersiveBackground) {
    drawImmersiveBackground(ctx, width, height);
  } else {
    ctx.fillStyle = BG_BLACK;
    ctx.fillRect(0, 0, width, height);
  }

  const sunState = bodyStates.get(bodies[0]?.id ?? "sun");
  const sunPos = sunState?.position ?? { x: 0, y: 0 };

  if (showAsteroidBelt) {
    drawBelt(
      ctx,
      width,
      height,
      camera,
      sunPos,
      ASTEROID_BELT_INNER_KM,
      ASTEROID_BELT_OUTER_KM,
      "rgba(160, 140, 100, 0.06)",
      "rgba(160, 140, 100, 0.2)",
      "Asteroid Belt",
      "rgba(160, 140, 100, 0.45)",
    );
  }

  if (showKuiperBelt) {
    drawBelt(
      ctx,
      width,
      height,
      camera,
      sunPos,
      KUIPER_BELT_INNER_KM,
      KUIPER_BELT_OUTER_KM,
      "rgba(100, 140, 180, 0.05)",
      "rgba(100, 140, 180, 0.18)",
      "Kuiper Belt",
      "rgba(100, 140, 180, 0.4)",
    );
  }

  if (showOortCloud) {
    drawBelt(
      ctx,
      width,
      height,
      camera,
      sunPos,
      OORT_CLOUD_INNER_KM,
      OORT_CLOUD_OUTER_KM,
      "rgba(80, 100, 140, 0.06)",
      "rgba(80, 100, 140, 0.18)",
      "Oort Cloud",
      "rgba(80, 100, 140, 0.45)",
    );
  }

  if (showHeliosphere) {
    drawHeliosphere(ctx, width, height, camera, sunPos);
  }

  if (showFullOrbits && orbitPaths) {
    for (const body of visibleBodies) {
      if (!body.orbit || body.orbit.eccentricity >= 1.0) continue;
      if (!isOrbitVisible(body.orbit, camera.kmPerPixel, width)) continue;

      const orbitPath = orbitPaths.get(body.id);
      if (!orbitPath || orbitPath.points.length < 4) continue;

      const parentId = body.parentId ?? bodies[0]?.id ?? "sun";
      const parentState = bodyStates.get(parentId);
      if (!parentState) continue;

      const parentScreen = worldToScreen(parentState.position, camera, width, height);
      const alpha = body.type === "moon" ? 0.15 : 0.2;
      const pts = orbitPath.points;
      const numPoints = pts.length / 2;

      ctx.beginPath();
      for (let i = 0; i < numPoints; i++) {
        const px = pts[i * 2];
        const py = pts[i * 2 + 1];
        const x = parentScreen.x + px / camera.kmPerPixel;
        const y = parentScreen.y - py / camera.kmPerPixel;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(100, 130, 180, ${alpha})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
  }

  for (const body of visibleBodies) {
    if (!body.orbit) continue;
    if (!isOrbitVisible(body.orbit, camera.kmPerPixel, width)) continue;

    const state = bodyStates.get(body.id);
    if (!state) continue;

    const parentId = body.parentId ?? bodies[0]?.id ?? "sun";
    const parentState = bodyStates.get(parentId);
    if (!parentState) continue;

    const parentScreen = worldToScreen(parentState.position, camera, width, height);

    const clipRadius = body.orbit.eccentricity >= 1.0 ? maxOrbitRadius * 2 : undefined;
    const trailPoints = computeTrailPointsCached(body, simTime, clipRadius);

    const bodyRgb = hexToRgb(body.color);
    const baseRgb =
      body.type === "probe" || body.type === "comet"
        ? TRAIL_PROBE_RGB
        : body.type === "moon"
          ? TRAIL_MOON_RGB
          : TRAIL_PLANET_RGB;
    const r = Math.round(bodyRgb.r * 0.4 + baseRgb.r * 0.6);
    const g = Math.round(bodyRgb.g * 0.4 + baseRgb.g * 0.6);
    const b = Math.round(bodyRgb.b * 0.4 + baseRgb.b * 0.6);

    const maxAlpha = body.type === "moon" ? 0.35 : body.type === "probe" || body.type === "comet" ? 0.45 : 0.5;
    const lineWidth = body.type === "moon" ? 0.8 : body.type === "probe" || body.type === "comet" ? 1.0 : 1.2;

    const relPos = {
      x: state.position.x - parentState.position.x,
      y: state.position.y - parentState.position.y,
    };

    drawTrail(
      ctx,
      trailPoints,
      parentScreen.x,
      parentScreen.y,
      camera.kmPerPixel,
      r,
      g,
      b,
      maxAlpha,
      lineWidth,
      relPos,
    );
  }

  const jupiterState = bodyStates.get("jupiter");
  if (jupiterState) {
    const jScreen = worldToScreen(jupiterState.position, camera, width, height);
    drawPlanetaryRing(
      ctx,
      jScreen.x,
      jScreen.y,
      JUPITER_RING_INNER_KM,
      JUPITER_RING_OUTER_KM,
      camera.kmPerPixel,
      "rgba(180, 160, 120, 0.15)",
      "rgba(180, 160, 120, 0.3)",
    );
  }
  const saturnState = bodyStates.get("saturn");
  if (saturnState) {
    const sScreen = worldToScreen(saturnState.position, camera, width, height);
    drawPlanetaryRing(
      ctx,
      sScreen.x,
      sScreen.y,
      SATURN_RING_INNER_KM,
      SATURN_RING_OUTER_KM,
      camera.kmPerPixel,
      "rgba(210, 190, 140, 0.2)",
      "rgba(210, 190, 140, 0.35)",
    );
  }

  for (const body of visibleBodies) {
    const state = bodyStates.get(body.id);
    if (!state) continue;

    const screen = worldToScreen(state.position, camera, width, height);
    if (screen.x < -100 || screen.x > width + 100 || screen.y < -100 || screen.y > height + 100) continue;

    const radiusPx = getDisplayRadius(body, camera.kmPerPixel, humanEyeScale);

    if (body.type === "star") {
      drawSunGlow(ctx, screen.x, screen.y, radiusPx);
    }

    if (body.type === "probe" || body.type === "comet") {
      drawDiamond(ctx, screen.x, screen.y, Math.max(radiusPx, 3), body.color);
    } else {
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, radiusPx, 0, Math.PI * 2);
      ctx.fillStyle = body.color;
      ctx.fill();
    }

    if (body.id === selectedBodyId && showSelectionIndicator) {
      drawSelectionIndicator(ctx, screen.x, screen.y, radiusPx);
    }
  }

  const labels = resolveLabels(ctx, visibleBodies, bodyStates, camera, width, height, humanEyeScale, selectedBodyId);
  for (const label of labels) {
    ctx.font = `${label.fontSize}px 'JetBrains Mono', 'Fira Code', monospace`;
    if (label.bodyId === selectedBodyId) {
      ctx.fillStyle = "rgba(220, 230, 255, 0.95)";
    } else if (label.isProbe) {
      ctx.fillStyle = "rgba(100, 220, 180, 0.8)";
    } else {
      ctx.fillStyle = "rgba(200, 210, 230, 0.8)";
    }
    ctx.textAlign = "left";
    ctx.fillText(label.text, label.x, label.y);
  }
}

export function renderMinimap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bodies: CelestialBodyData[],
  bodyStates: Map<string, BodyState>,
  mainCamera: CameraState,
  mainCanvasWidth: number,
  mainCanvasHeight: number,
  selectedBodyId: string,
  maxOrbitRadius: number,
): void {
  ctx.fillStyle = "rgba(10, 10, 18, 0.85)";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(60, 80, 120, 0.5)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, width, height);

  const scale = Math.min(width, height) / (maxOrbitRadius * 2.4);
  const cx = width / 2;
  const cy = height / 2;

  for (const body of bodies) {
    if (body.type === "moon") continue;
    const state = bodyStates.get(body.id);
    if (!state) continue;

    const sx = cx + state.position.x * scale;
    const sy = cy - state.position.y * scale;

    const dotSize =
      body.type === "star"
        ? 3
        : body.type === "probe" || body.type === "comet"
          ? 1
          : body.type === "dwarf-planet"
            ? 1
            : 1.5;
    ctx.fillStyle = body.id === selectedBodyId ? "#6496ff" : body.color;
    ctx.beginPath();
    ctx.arc(sx, sy, dotSize, 0, Math.PI * 2);
    ctx.fill();
  }

  const halfViewW = (mainCanvasWidth * mainCamera.kmPerPixel) / 2;
  const halfViewH = (mainCanvasHeight * mainCamera.kmPerPixel) / 2;
  const viewLeft = cx + (mainCamera.center.x - halfViewW) * scale;
  const viewTop = cy - (mainCamera.center.y + halfViewH) * scale;
  const viewW = halfViewW * 2 * scale;
  const viewH = halfViewH * 2 * scale;

  if (viewW < width * 2 && viewH < height * 2) {
    ctx.strokeStyle = "rgba(100, 150, 255, 0.6)";
    ctx.lineWidth = 1;
    ctx.strokeRect(viewLeft, viewTop, viewW, viewH);
  }
}

export function hitTestBody(
  screenX: number,
  screenY: number,
  camera: CameraState,
  canvasWidth: number,
  canvasHeight: number,
  bodies: CelestialBodyData[],
  bodyStates: Map<string, BodyState>,
  humanEyeScale: boolean,
): string | null {
  let closest: string | null = null;
  let closestDist = Infinity;

  const reversed = [...bodies].reverse();
  for (const body of reversed) {
    const state = bodyStates.get(body.id);
    if (!state) continue;

    const screen = worldToScreen(state.position, camera, canvasWidth, canvasHeight);
    const radiusPx = getDisplayRadius(body, camera.kmPerPixel, humanEyeScale);
    const hitRadius = Math.max(radiusPx, 8);

    const dx = screenX - screen.x;
    const dy = screenY - screen.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= hitRadius && dist < closestDist) {
      closest = body.id;
      closestDist = dist;
    }
  }

  return closest;
}
