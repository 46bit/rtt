import { IPowerSource } from '.';
import * as abilities from '../abilities';

export interface IPowerGenerator extends abilities.IConstructableEntity, abilities.IOwnableEntity, abilities.ICollidableEntity {
  kind: "powerGenerator";
  powerSource: IPowerSource;
  upgrading: boolean;
  upgradeLevel: number;
  energyProvided: number;
}

export const PowerGeneratorMetadata = {
  collisionRadius: 8,
  buildCost: 300,
  fullHealth: 60,
  constructableByMobileUnits: true,
  maxUpgradeLevel: 4,
  upgradeHealthMultiplier: 2,
  upgradeEnergyOutputMultiplier: 2,
  upgradeBuildCostMultiplier: 4,
};
