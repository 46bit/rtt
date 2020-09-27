import { newPhysics } from '.';
import * as abilities from '../abilities';
import { IConstructableVehicleEntity } from '../lib';

export interface IEngineer extends IConstructableVehicleEntity, abilities.IEngineerEntity {
  kind: "engineer";
}

export const EngineerMetadata = {
  collisionRadius: 6,
  buildCost: 50,
  constructableByMobileUnits: false,
  fullHealth: 16,
  movementRate: 0.06,
  turnRate: 4.0 / 3.0,
  physics: newPhysics(),
  productionRange: 25.0,
};
