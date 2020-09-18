import { IEntity, newEntity } from '../lib/entity';
import { IKillable, IKillableConfig, newKillable, repair } from './killable';
import { UnitMetadata, KindsOfUnitsWithAbility } from '../lib/poc';

export interface IConstructableConfig extends IKillableConfig {
  buildCost: number;
  constructableByMobileUnits: boolean;
}

export type ConstructableUnits = KindsOfUnitsWithAbility<IConstructableConfig>;

export interface IConstructable<K extends ConstructableUnits> extends IKillable<K> {
  built: boolean;
}

export function newConstructable<E extends IKillable<ConstructableUnits>>(value: E): IConstructable<ConstructableUnits> {
  return {...value, built: false};
}

export function isBuilt(value: IConstructable<ConstructableUnits>): boolean {
  return value.built;
}

export function isUnderConstruction(value: IConstructable<ConstructableUnits>): boolean {
  return !value.dead && !value.built;
}

export function buildCostPerHealth(value: IConstructable<ConstructableUnits>): number {
  return (UnitMetadata[value.kind].buildCost ?? UnitMetadata[value.kind].fullHealth * 10) / UnitMetadata[value.kind].fullHealth;
}

export function build(value: IConstructable<ConstructableUnits>, amount: number): IConstructable<ConstructableUnits> {
  repair(value, amount);
  if (!value.dead && !value.built) {
    value.built = (value.health === UnitMetadata[value.kind].fullHealth);
  }
  return value;
}

const bot: IBot = newConstructable(newKillable(newEntity({kind: "bot", position: new Vector(5, 5)})));
