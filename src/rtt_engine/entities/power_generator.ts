import { IPowerSource } from '.';
import * as abilities from '../abilities';

export type PowerGeneratorAbilities =
  abilities.IConstructableEntity
  & abilities.IOwnableEntity
  & abilities.ICollidableEntity
  & abilities.IOrderableEntity;

export interface IPowerGenerator extends PowerGeneratorAbilities {
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
