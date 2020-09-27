import { IPowerSource } from '.';
import * as abilities from '../abilities';

export interface IPowerGenerator extends abilities.IConstructableEntity, abilities.IOwnableEntity, abilities.ICollidableEntity {
  kind: "powerGenerator";
  powerSource: IPowerSource;
  energyOutput: number;
  upgrading: boolean;
  energyProvided: number;
}

export const PowerGeneratorMetadata = {
  collisionRadius: 8,
  buildCost: 300,
  fullHealth: 60,
  constructableByMobileUnits: true,
};
