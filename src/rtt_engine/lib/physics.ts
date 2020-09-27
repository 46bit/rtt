import { Vector } from '..';

export interface IPhysics {
  mass: number;
  power: number;
  frictionCoefficient: number;
  dragCoefficient: number;
  dragArea: number;
  airMassDensity: number;
  rollingResistanceCoefficient: number;
  // This one isn't well-founded at all. We might want to model dynamics–angular momentum.
  turnCoefficient: number;
}

// FIXME: Change this to a global const, and precompute a lot of the functions further down?
export function newPhysics(): IPhysics {
  return {
    mass: 1.0,
    power: 5.0,
    frictionCoefficient: 1.0,
    dragCoefficient: 0.03,
    dragArea: 1.0,
    // Air mass density seems to be closer to 1.2, but that gave severe results
    airMassDensity: 0.5,
    rollingResistanceCoefficient: 0.1,
    turnCoefficient: 2500.0,
  };
}

export function normalForce(value: IPhysics) {
  return value.mass * 9.81;
}

export function grip(value: IPhysics) {
  return normalForce(value) * value.frictionCoefficient;
}

export function momentum(value: IPhysics, velocity: number) {
  return value.mass * velocity;
}

export function airResistance(value: IPhysics, velocity: number) {
  return 0.5 * value.airMassDensity * Math.pow(velocity, 2) * value.dragCoefficient * value.dragArea;
}

export function rollingResistance(value: IPhysics) {
  return value.rollingResistanceCoefficient * normalForce(value);
}

export function rollingResistanceForces(value: IPhysics, velocity: number, angularVelocity: number) {
  const speed = Math.abs(velocity) + Math.abs(angularVelocity);
  if (speed === 0) {
    return new Vector(0, 0);
  }
  const perUnit = rollingResistance(value) / speed;
  return new Vector(velocity * perUnit, angularVelocity * perUnit);
}

export function maxAccelerationForce(value: IPhysics) {
  return Math.min(value.power, grip(value));
}

export function turningAngle(value: IPhysics) {
    return Math.PI / value.turnCoefficient;
}
