import { IEntity } from '../lib/entity';
import { IKillable, IKillableConfig, newKillable, repair } from './killable';

export interface IConstructableConfig extends IKillableConfig {
  built: boolean;
  buildCost: number;
  constructableByMobileUnits: boolean;
}

export interface IConstructable extends IKillable {
  buildCost: number;
  built: boolean;
  constructableByMobileUnits: boolean;
}

export function newConstructable<E extends IEntity>(value: E, cfg: IConstructableConfig): E & IConstructable {
  return {
    ...newKillable(value, cfg),
    buildCost: cfg.buildCost,
    built: cfg.built,
    constructableByMobileUnits: cfg.constructableByMobileUnits,
  };
}

export function isBuilt(value: IConstructable): boolean {
  return value.built;
}

export function isUnderConstruction(value: IConstructable): boolean {
  return !value.dead && !value.built;
}

export function buildCostPerHealth(value: IConstructable): number {
  return (value.buildCost ?? value.fullHealth * 10) / value.fullHealth;
}

export function build(value: IConstructable, amount: number): IConstructable {
  repair(value, amount);
  if (!value.dead && !value.built) {
    value.built = (value.health === value.fullHealth);
  }
  return value;
}
