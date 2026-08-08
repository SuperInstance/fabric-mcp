/**
 * Interface for a non-participatory, passive agent that provides
 * a high-precision spatial anchor (Ground Truth) for other agents.
 */
export interface PassiveObserver {
  getAnchorPoint(): [number, number, number];
  heartbeat(): number;
}

/**
 * The Sentinel is a "Zero-Energy" archetype.
 * It acts as a static, high-precision reference point in the coordinate system.
 * It has very low computational requirements.
 */
export class SentinelArchetype implements PassiveObserver {
  public readonly isStatic: true = true;
  private readonly anchorPoint: [number, number, number];

  constructor(anchorPoint: [number, number, number] = [0, 0, 0]) {
    this.anchorPoint = anchorPoint;
  }

  /**
   * Returns the high-precision [x, y, z] coordinate for this anchor.
   */
  public getAnchorPoint(): [number, number, number] {
    return this.anchorPoint;
  }

  /**
   * A highly lightweight heartbeat to satisfy Zero-Energy requirements.
   * Returns the current epoch timestamp.
   */
  public heartbeat(): number {
    return Date.now();
  }
}
