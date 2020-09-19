import { nanoid } from 'nanoid';
import { Vector } from '../../vector';
import { UnitMetadata, KindsOfUnits, KindsOfUnitsWithAbility } from '../lib/poc';
import { Order, OrderMatchCases } from './orderable';

export interface IEntityMetadata {}
export interface IEntityState {
  id: string;
  kind: KindsOfUnits;
  position: Vector;
}
export function newEntity(cfg: {kind: KindsOfUnits, position: Vector}): IEntityState {
  return {
    id: nanoid(),
    kind: cfg.kind,
    position: cfg.position,
  };
}



export type KillableUnits = KindsOfUnitsWithAbility<IKillableMetadata>;
export interface IKillableMetadata extends IEntityMetadata {
  fullHealth: number;
}
export interface IKillableState extends IEntityState {
  health: number;
  dead: boolean;
  orders?: Order[];
}
export type IKillableEntityFields = Omit<IKillableState, keyof IEntityState>;
export function newKillable(kind: KillableUnits): IKillableEntityFields {
  return {
    health: UnitMetadata[kind].fullHealth,
    dead: false,
  };
}



export type ConstructableUnits = KindsOfUnitsWithAbility<IConstructableMetadata>;
export interface IConstructableMetadata extends IKillableMetadata {
  buildCost: number;
  constructableByMobileUnits: boolean;
}
export interface IConstructableState extends IKillableState {
  built: boolean;
}
export type IConstructableEntityFields = Omit<IConstructableState, keyof IKillableState>;
export function newConstructable(kind: ConstructableUnits): IConstructableEntityFields {
  return {built: false};
}



export type OrderableUnits = KindsOfUnitsWithAbility<IOrderableMetadata>;
export interface IOrderableMetadata extends IKillableMetadata {
  orderBehaviours: OrderMatchCases<boolean>;
}
export interface IOrderableState extends IKillableState {
  orders: Order[];
}
export type IOrderableStateFields = Omit<IOrderableState, Exclude<keyof IKillableState, "orders">>;
export function newOrderable(kind: OrderableUnits): IOrderableStateFields {
  return {orders: []};
}
//export type Orderable = IOrderable;



type BotStateAbilities = IOrderableState & IConstructableState & IKillableState & IEntityState;
interface BotState extends BotStateAbilities {}
export function newBot(position: Vector): BotState {
  return {
    ...newEntity({kind: "bot", position}),
    ...newKillable("bot"),
    ...newConstructable("bot"),
    ...newOrderable("bot"),
  };
}
const bot: BotState = newBot(new Vector(5, 5));
const killable: IKillableState = bot;
const constructable: IConstructableState = bot;
const orderable: IOrderableState = bot;



// const bot = newConstructable(newKillable(newEntity({kind: "shotgunTank", position: new Vector(5, 5)})));
// const killable: Killable = bot;
// const constructable: Constructable = bot;

// function useKillable(k: Killable): void {
//   console.log(UnitMetadata[k.kind].fullHealth);
//   console.log(k);
// }
// function useConstructable(k: Constructable): void {
//   console.log(UnitMetadata[k.kind].buildCost);
//   console.log(k);
// }
// useKillable(bot);
// useConstructable(bot);

// const bot2 = newOrderable(newConstructable(newKillable(newEntity({kind: "bot", position: new Vector(5, 5)}))));
// const killable2: Killable = bot2;
// const constructable2: Constructable = bot2;
// const orderable2: Orderable = bot2;
// function useOrderable(k: Orderable): void {
//   console.log(UnitMetadata[k.kind].orderBehaviours);
//   console.log(k);
// }
// useKillable(bot2);
// useConstructable(bot2);
// useOrderable(bot2);
