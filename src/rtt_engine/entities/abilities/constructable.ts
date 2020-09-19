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

export type IConstructableStateFields = Omit<IConstructableState, keyof IKillableState>;
export function newConstructable<K extends ConstructableUnits>(kind: K): IConstructableStateFields {
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
import { IOwnableState, OwnableUnits, newOwnable, captureOwnable } from './ownable';
import { ICollidableState, CollidableUnits, isColliding } from './collidable';
import { IMovableState, MovableUnits, newMovable, updatePosition } from './movable';
import { ISteerableState, SteerableUnits, newSteerable, updateDirection } from './steerable';
import { IEngineerState, EngineerUnits, newEngineer, isWithinProductionRange } from './engineer';
type BotStateAbilities = ISteerableState & IMovableState & ICollidableState & IOwnableState & IOrderableState & IConstructableState & IKillableState & IEntityState;
interface BotState extends BotStateAbilities {}
function newBot(position: Vector): BotState {
  return {
    ...newEntity({kind: "bot", position}),
    ...newKillable("bot"),
    ...newConstructable("bot"),
    ...newOrderable("bot"),
    ...newOwnable("bot", null),
    ...newMovable("bot"),
    ...newSteerable("bot"),
  };
}
const bot = newBot(new Vector(5, 5));
const built: boolean = isBuilt(bot);
const t = build(bot, 10);
const t2 = updateOrders(bot, {context: {pathfinder: (a: any, b: any) => null}});
const k = kill(bot);
const capB = captureOwnable(bot, null);
const b = isColliding(bot, bot);
bot.velocity += 10;
const m = updatePosition(bot);
const f = updateDirection(bot);

type ComStateAbilities = IEngineerState & ISteerableState & IMovableState & ICollidableState & IOwnableState & IOrderableState & IKillableState & IEntityState;
interface ComState extends ComStateAbilities {}
function newCom(position: Vector): ComState {
  return {
    ...newEntity({kind: "commander", position}),
    ...newKillable("commander"),
    ...newOrderable("commander"),
    ...newOwnable("commander", null),
    ...newMovable("commander"),
    ...newSteerable("commander"),
    ...newEngineer("commander"),
  };
}
const com = newCom(new Vector(5, 5));
const comt2 = updateOrders(com, {context: {pathfinder: (a: any, b: any) => null}});
const comk = kill(com);
const comcapB = captureOwnable(com, null);
const comb = isColliding(com, com);
com.velocity += 10;
const comm = updatePosition(com);
const comf = updateDirection(com);
const comis = isWithinProductionRange(com, new Vector(10, 10));
