import { IEntityState, newEntity } from '../lib/entity';
import { IKillableState, IKillableMetadata, KillableUnits, newKillable, repair } from './killable';
import { UnitMetadata, KindsOfUnitsWithAbility } from '../lib/poc';

export type ConstructableUnits = KindsOfUnitsWithAbility<IConstructableMetadata>;
export interface IConstructableMetadata extends IKillableMetadata {
  buildCost: number;
  constructableByMobileUnits: boolean;
}

export interface IConstructableState extends IKillableState {
  kind: ConstructableUnits;
  built: boolean;
}

export type IConstructableEntityFields = Omit<IConstructableState, keyof IKillableState>;
export function newConstructable<K extends ConstructableUnits>(kind: K): IConstructableEntityFields {
  return {built: false};
}

export function isBuilt(value: IConstructableState): boolean {
  return value.built;
}

export function isUnderConstruction(value: IConstructableState): boolean {
  return !value.dead && !value.built;
}

export function buildCostPerHealth(value: IConstructableState): number {
  return (UnitMetadata[value.kind].buildCost ?? UnitMetadata[value.kind].fullHealth * 10) / UnitMetadata[value.kind].fullHealth;
}

export function build<T extends IConstructableState>(value: T, amount: number): T {
  if (!UnitMetadata[value.kind].constructableByMobileUnits) {
    return value;
  }
  repair(value, amount);
  if (!value.dead && !value.built) {
    value.built = (value.health === UnitMetadata[value.kind].fullHealth);
  }
  return value;
}

import { Vector } from '../../vector';
type BotStateAbilities = IConstructableState & IKillableState & IEntityState;
interface BotState extends BotStateAbilities {}
function newBot(kind: ConstructableUnits & KillableUnits): BotState {
  return {
    ...newEntity({kind: "bot", position: new Vector(5, 5)}),
    ...newKillable("bot"),
    ...newConstructable("bot"),
  };
}
