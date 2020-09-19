import { IEntityState, newEntity } from '../lib/entity';
import { IKillableState, IKillableMetadata, KillableUnits, newKillable, repair, kill } from './killable';
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

// Testing for type errors
import { Vector } from '../../vector';
import { IOrderableState, OrderableUnits, newOrderable, updateOrders } from './orderable';
type BotStateAbilities = IOrderableState & IConstructableState & IKillableState & IEntityState;
interface BotState extends BotStateAbilities {}
function newBot(position: Vector): BotState {
  return {
    ...newEntity({kind: "bot", position}),
    ...newKillable("bot"),
    ...newConstructable("bot"),
    ...newOrderable("bot"),
  };
}

const bot = newBot(new Vector(5, 5));
const built: boolean = isBuilt(bot);
const t = build(bot, 10);
const t2 = updateOrders(bot, {context: {pathfinder: (a: any, b: any) => null}});
const k = kill(bot);
