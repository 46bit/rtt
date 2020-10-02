import * as abilities from '../abilities';
import { IConstructableVehicleEntity } from '../lib';
import { physics } from '../lib/physics';

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
  physics,
  productionRange: 25.0,
};
