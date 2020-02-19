import { Vector } from '../../vector';

export class VehicleTurret {
  public turnRate: number;
  public force: number;
  public friction: number;
  public rotation: number;
  public rotationalVelocity: number;
  public tolerance: number;

  constructor(turnRate: number, force: number, friction: number, tolerance = 0.06) {
    this.turnRate = turnRate;
    this.force = force;
    this.friction = friction;
    this.rotation = 0;
    this.rotationalVelocity = 0;
    this.tolerance = tolerance;
  }

  public update(defaultDirection: number) {
    this.applyDragForces();
    // FIXME: terrible hack
    this.force /= 3;
    this.updateRotationalVelocity(0, defaultDirection);
    this.force *= 3;
  }

  public updateTowards(baseDirection: number, targetDirection: number) {
    this.applyDragForces();
    this.updateRotationalVelocity(baseDirection, targetDirection);
  }

  protected applyDragForces() {
    this.rotationalVelocity *= (1 - this.friction);
  }

  protected updateRotationalVelocity(baseDirection: number, targetDirection: number) {
    const diff = targetDirection - baseDirection;
    if (this.shouldTurnLeftToReach(diff - this.rotation)) {
      this.rotationalVelocity -= this.force;
      this.updateRotation();
      if (this.shouldTurnRightToReach(diff - this.rotation)) {
        this.rotation = targetDirection;
        this.rotationalVelocity = 0;
      }
    } else if (this.shouldTurnRightToReach(diff - this.rotation)) {
      this.rotationalVelocity += this.force;
      this.updateRotation();
      if (this.shouldTurnLeftToReach(diff - this.rotation)) {
        this.rotation = targetDirection;
        this.rotationalVelocity = 0;
      }
    } else {
      this.updateRotation();
      return;
    }
    // FIXME: Don't update rotationalVelocity if the rotation is going to overshoot
  }

  protected shouldTurnLeftToReach(angle: number) {
    return Math.sin(angle) < -this.tolerance;
  }

  protected shouldTurnRightToReach(angle: number) {
    return Math.sin(angle) > this.tolerance;
  }

  protected updateRotation() {
    this.rotation += this.rotationalVelocity * this.turnRate;
    // Normalise @direction to keep within [-PI, PI]
    if (this.rotation < -Math.PI) {
      this.rotation += Math.PI * 2;
    }
    if (this.rotation > Math.PI) {
      this.rotation -= Math.PI * 2;
    }
  }
}
