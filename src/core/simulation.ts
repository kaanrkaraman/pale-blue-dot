import { computeOrbitalPosition, orbitalVelocity } from "./kepler";
import type { BodyState, CelestialBodyData, Vec2 } from "./types";

/**
 * Compute all body positions at a given simulation time (Julian days since J2000).
 * Bodies must be in dependency order (parents before children).
 */
export function computeAllPositions(
  daysSinceEpoch: number,
  bodies: CelestialBodyData[],
  centerBodyId: string,
): Map<string, BodyState> {
  const states = new Map<string, BodyState>();

  const centerBody = bodies.find((b) => b.id === centerBodyId);
  if (centerBody) {
    states.set(centerBodyId, {
      id: centerBodyId,
      position: { x: 0, y: 0 },
      trueAnomaly: 0,
      distanceFromCenter: 0,
      orbitalRadius: 0,
      velocity: 0,
    });
  }

  for (const body of bodies) {
    if (body.id === centerBodyId) continue;
    if (!body.orbit) continue;

    const { position, trueAnomaly, orbitalRadius } = computeOrbitalPosition(body.orbit, daysSinceEpoch);

    let absolutePos: Vec2;

    if (body.parentId && body.parentId !== centerBodyId) {
      const parentState = states.get(body.parentId);
      if (parentState) {
        absolutePos = {
          x: parentState.position.x + position.x,
          y: parentState.position.y + position.y,
        };
      } else {
        absolutePos = position;
      }
    } else {
      absolutePos = position;
    }

    // Use true 3D orbital radius for direct children of center (important for
    // high-inclination bodies like Voyager 1 at 35.77° where 2D projection
    // significantly underestimates the real distance).
    // For moons, use the parent's 3D distance as base (inclinations are small).
    let distanceFromCenter: number;
    if (!body.parentId || body.parentId === centerBodyId) {
      distanceFromCenter = orbitalRadius;
    } else {
      const parentState = states.get(body.parentId);
      distanceFromCenter = parentState ? parentState.orbitalRadius + orbitalRadius : orbitalRadius;
    }

    const velocity = orbitalVelocity(body.orbit, orbitalRadius > 0 ? orbitalRadius : undefined);

    states.set(body.id, {
      id: body.id,
      position: absolutePos,
      trueAnomaly,
      distanceFromCenter,
      orbitalRadius,
      velocity,
    });
  }

  return states;
}

export function getRelativePosition(childState: BodyState, parentState: BodyState): Vec2 {
  return {
    x: childState.position.x - parentState.position.x,
    y: childState.position.y - parentState.position.y,
  };
}

export function getDistanceBetween(a: BodyState, b: BodyState): number {
  const dx = a.position.x - b.position.x;
  const dy = a.position.y - b.position.y;
  return Math.sqrt(dx * dx + dy * dy);
}
