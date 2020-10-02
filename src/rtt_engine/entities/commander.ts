import { IVehicleEntity } from '../lib';
import { physics } from '../lib/physics';
import * as abilities from '../abilities';

export interface ICommander extends IVehicleEntity, abilities.IEngineerEntity {
  kind: "commander";
}

export const CommanderMetadata = {
  collisionRadius: 8,
  fullHealth: 1000,
  movementRate: 0.03,
  turnRate: 2.0 / 3.0,
  physics,
  productionRange: 35.0,
  energyOutput: 5,
};
