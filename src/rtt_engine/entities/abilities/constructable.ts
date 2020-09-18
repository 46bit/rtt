import { IEntity } from '../lib/entity';
import { IKillable, IKillableConfig, newKillable, repair } from './killable';

export interface IConstructableConfig extends IKillableConfig {
  buildCost: number;
  constructableByMobileUnits: boolean;
}

export interface IConstructable extends IKillable {
  built: boolean;
  metadata: IConstructableConfig;
}

export function isBuilt(value: IConstructable): boolean {
  return value.built;
}

export function isUnderConstruction(value: IConstructable): boolean {
  return !value.dead && !value.built;
}

export function buildCostPerHealth(value: IConstructable): number {
  return (value.metadata.buildCost ?? value.fullHealth * 10) / value.fullHealth;
}

export function build(value: IConstructable, amount: number): IConstructable {
  repair(value, amount);
  if (!value.dead && !value.built) {
    value.built = (value.health === value.fullHealth);
  }
  return value;
}

type interface IEntity {
  state: IEntityState,
  metadata: IEntityMetadata,
};
