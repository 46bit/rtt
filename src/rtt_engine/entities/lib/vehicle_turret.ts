import { Vector } from '../../vector';

export interface IVehicleTurretConfig {
  turnRate: number;
  force: number;
  friction: number;
  rotation: number;
  rotationalVelocity: number;
  tolerance?: number;
}

export interface IVehicleTurret {
  turnRate: number;
  force: number;
  friction: number;
  rotation: number;
  rotationalVelocity: number;
  tolerance: number;
}

export function newVehicleTurret(cfg: IVehicleTurretConfig): IVehicleTurret {
  return {
    turnRate: cfg.turnRate,
    force: cfg.force,
    friction: cfg.friction,
    rotation: 0,
    rotationalVelocity: 0,
    tolerance: cfg.tolerance ?? 0.06,
  };
}

export function updateVehicleTurret(value: IVehicleTurret, defaultDirection: number) {
  applyDragForces(value);
  // FIXME: terrible hack
  value.force /= 3;
  updateRotationalVelocity(value, 0, defaultDirection);
  value.force *= 3;
}

export function updateTowards(value: IVehicleTurret, baseDirection: number, targetDirection: number) {
  applyDragForces(value);
  updateRotationalVelocity(value, baseDirection, targetDirection);
}

function applyDragForces(value: IVehicleTurret) {
  value.rotationalVelocity *= (1 - value.friction);
}

function updateRotationalVelocity(value: IVehicleTurret, baseDirection: number, targetDirection: number) {
  const diff = targetDirection - baseDirection;
  if (turretShouldTurnLeftToReach(value, diff - value.rotation)) {
    value.rotationalVelocity -= value.force;
    updateTurretRotation(value);
    if (turretShouldTurnRightToReach(value, diff - value.rotation)) {
      value.rotation = targetDirection;
      value.rotationalVelocity = 0;
    }
  } else if (turretShouldTurnRightToReach(value, diff - value.rotation)) {
    value.rotationalVelocity += value.force;
    updateTurretRotation(value);
    if (turretShouldTurnLeftToReach(value, diff - value.rotation)) {
      value.rotation = targetDirection;
      value.rotationalVelocity = 0;
    }
  } else {
    updateTurretRotation(value);
    return;
  }
  // FIXME: Don't update rotationalVelocity if the rotation is going to overshoot
}

function turretShouldTurnLeftToReach(value: IVehicleTurret, angle: number) {
  return Math.sin(angle) < -value.tolerance;
}

function turretShouldTurnRightToReach(value: IVehicleTurret, angle: number) {
  return Math.sin(angle) > value.tolerance;
}

function updateTurretRotation(value: IVehicleTurret) {
  value.rotation += value.rotationalVelocity * value.turnRate;
  // Normalise @direction to keep within [-PI, PI]
  if (value.rotation < -Math.PI) {
    value.rotation += Math.PI * 2;
  }
  if (value.rotation > Math.PI) {
    value.rotation -= Math.PI * 2;
  }
}
