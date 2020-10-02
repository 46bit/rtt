import { IConstructableVehicleEntity } from '../lib';
import { physics } from '../lib/physics';
import * as abilities from '../abilities';

export interface IBot extends IConstructableVehicleEntity {
  kind: "bot";
}

export const BotMetadata = {
  collisionRadius: 5,
  buildCost: 70,
  constructableByMobileUnits: false,
  fullHealth: 10,
  movementRate: 0.15,
  turnRate: 5.0 / 3.0,
  physics,
};
