export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export type ViewMode = "2d" | "3d";

export interface BodyState3D {
  id: string;
  /** km, ecliptic coordinates: x,y in-plane, z out-of-plane */
  position: Vec3;
}
