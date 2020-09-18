import { IEntity } from '../lib/entity';
import { IKillable, IKillableConfig, KindsOfUnitsThatAreKillable, newKillable, repair } from './killable';
import { UnitMetadata, KindsOfUnitsWithAbility } from '../lib/poc';

export interface IConstructableConfig extends IKillableConfig {
  buildCost: number;
  constructableByMobileUnits: boolean;
}

export type ConstructableUnits = KindsOfUnitsWithAbility<IConstructableConfig>;

export interface IConstructable extends IKillable {
  built: boolean;
}

export type FieldsOfIConstructable = Omit<IConstructable, "kind">;

export function newConstructable<K extends ConstructableUnits, E extends IEntity<K>>(value: E): E & FieldsOfIConstructable {
  return {
    ...newKillable(value),
    built: false,
  };
}

export function isBuilt(value: IConstructable): boolean {
  return value.built;
}

export function isUnderConstruction(value: IConstructable): boolean {
  return !value.dead && !value.built;
}

export function buildCostPerHealth(value: IConstructable): number {
  return (UnitMetadata[value.kind].buildCost ?? UnitMetadata[value.kind].fullHealth * 10) / UnitMetadata[value.kind].fullHealth;
}

export function build(value: IConstructable, amount: number): IConstructable {
  repair(value, amount);
  if (!value.dead && !value.built) {
    value.built = (value.health === UnitMetadata[value.kind].fullHealth);
  }
  return value;
}
