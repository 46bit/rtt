import { Vector } from '../../vector';

export class Physics {
  public mass: number;
  public power: number;
  public frictionCoefficient: number;
  public dragCoefficient: number;
  public dragArea: number;
  public airMassDensity: number;
  public rollingResistanceCoefficient: number;
  // This one isn't well-founded at all. We might want to model dynamics–angular momentum.
  public turnCoefficient: number;

  // FIXME: Refactor as `interface Physics` and `class DefaultPhysics`
  constructor() {
    this.mass = 1.0;
    this.power = 5.0;
    this.frictionCoefficient = 1.0;
    this.dragCoefficient = 0.03;
    this.dragArea = 1.0;
    // Air mass density seems to be closer to 1.2, but that gave severe results
    this.airMassDensity = 0.5;
    this.rollingResistanceCoefficient = 0.1;
    this.turnCoefficient = 2500.0; // 3500.0
  }

  public normalForce() {
    return this.mass * 9.81;
  }

  public grip() {
    return this.normalForce() * this.frictionCoefficient;
  }

  public momentum(velocity: number) {
    return this.mass * velocity;
  }

  public airResistance(velocity: number) {
    return 0.5 * this.airMassDensity * Math.pow(velocity, 2) * this.dragCoefficient * this.dragArea;
  }

  public rollingResistance() {
    return this.rollingResistanceCoefficient * this.normalForce();
  }

  public rollingResistanceForces(velocity: number, angularVelocity: number) {
    const speed = Math.abs(velocity) + Math.abs(angularVelocity);
    if (speed === 0) {
      return new Vector(0, 0);
    }
    const perUnit = this.rollingResistance() / speed;
    return new Vector(velocity * perUnit, angularVelocity * perUnit);
  }

  public maxAccelerationForce() {
    return Math.min(this.power, this.grip());
  }

  public turningAngle() {
    return Math.PI / this.turnCoefficient;
  }
}
