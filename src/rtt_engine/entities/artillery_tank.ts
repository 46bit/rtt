import lodash from 'lodash';
import { Player, Vector } from '../';
import * as abilities from './abilities';
import { UnitMetadata, IVehicleMetadata, IVehicleState, newVehicle, vehicleOrderBehaviours } from './';

export const ARTILLERY_RANGE = 210;

export interface IArtilleryTankMetadata extends IVehicleMetadata {}

export interface IArtilleryTankState extends IVehicleState {
  kind: "artilleryTank";
}

export function newArtilleryTank(position: Vector, player: Player | null): IArtilleryTankState {
  const kind = "artilleryTank";
  return {
    kind,
    ...newVehicle(kind, position, player),
  };
}

export const artilleryTankOrderBehaviours: abilities.OrderMatchAllCases<IArtilleryTankState, boolean> = {
  ...vehicleOrderBehaviours as abilities.OrderMatchAllCases<IArtilleryTankState, boolean>,
  attack: artilleryTankAttack,
};

export function artilleryTankUpdate(value: IArtilleryTankState, input: {enemies: IEntity[], context: IEntityUpdateContext}) {
  if (value.dead) {
    return;
  }
  super.update(input);
  this.updateCounter++;

  if (this.updateCounter >= this.firingRate && this.velocity == 0) {
    const angleToFireProjectile = this.angleToNearestEnemy(input.enemies);
    if (angleToFireProjectile == null) {
      return;
    }
    const projectile = new ArtilleryProjectile(this.position, this.player!, angleToFireProjectile);
    this.player!.turretProjectiles.push(projectile);
    this.updateCounter = 0;
  }
}

export function angleToNearestEnemy(enemies: IEntity[]): number | null {
  const nearestEnemy = lodash.minBy(enemies, (e) => Vector.subtract(this.position, e.position).magnitude());
  if (nearestEnemy == null) {
    return null;
  }
  const offset = Vector.subtract(nearestEnemy.position, this.position);
  if (offset.magnitude() > ARTILLERY_RANGE * 1.1) {
    return null;
  }
  return offset.angle();
}

export function artilleryTankAttack(value: IArtilleryTankState, attackOrder: abilities.AttackOrder): boolean {
  if (attackOrder.target.dead) {
    return false;
  }
  const distance = Vector.subtract(value.position, attackOrder.target.position).magnitude();
  if (distance > ARTILLERY_RANGE) {
    UnitMetadata[value.kind].orderBehaviours.manoeuvre!(value, {
      destination: attackOrder.target.position,
      context: attackOrder.context,
    });
  }
  return true;
}
