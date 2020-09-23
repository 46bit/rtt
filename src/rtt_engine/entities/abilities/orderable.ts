import lodash from 'lodash';
import { unionize, ofType, UnionOf } from 'unionize';
import { Vector } from '../../vector';
import { IKillableMetadata, IKillableState, newKillable } from './killable';
import { IEntityState, IEntityUpdateContext, newEntity } from '../lib/entity';
import { UnitMetadata, KindsOfUnitsWithAbility } from '../lib/poc';

export type OrderableUnits = KindsOfUnitsWithAbility<IOrderableMetadata>;
export interface IOrderableMetadata extends IKillableMetadata {
  orderBehaviours: OrderMatchCases<any, boolean>;
}

export interface IOrderableState extends IKillableState {
  kind: OrderableUnits;
  orders: Order[];
}

export type IOrderableStateFields = Omit<IOrderableState, Exclude<keyof IKillableState, "orders">>;
export function newOrderable<K extends OrderableUnits>(value: K): IOrderableStateFields {
  return {orders: []};
}

export function updateOrders<T extends IOrderableState>(value: T, context: IEntityUpdateContext): T {
  const order: Order = value.orders[0];
  if (order) {
    // FIXME: Add support for arbitrary extra arguments to unionize, and then use that
    // instead of hiding the context in the order
    const orderWithUpdateContext = {...order, context};
    // FIXME: Stop doing this! It breaks `default`. Just import all of `unionize` and tweak it.
    const orderBehaviours: OrderMatchAllCases<any, boolean> = UnitMetadata[value.kind].orderBehaviours;
    const orderBehaviour = orderBehaviours[order.kind] || orderBehaviours.default;
    const orderStillInProgress = orderBehaviour(value, orderWithUpdateContext);
    if (!orderStillInProgress) {
      value.orders.shift();
    }
  }
  return value;
}

export function supportedKindsOfOrders(value: IOrderableState): string[] {
  return lodash.keys(UnitMetadata[value.kind].orderBehaviours);
}

export const OrderUnion = unionize({
  manoeuvre: ofType<ManoeuvreOrder>(),
  attack: ofType<AttackOrder>(),
  patrol: ofType<PatrolOrder>(),
  guard: ofType<GuardOrder>(),
  constructStructure: ofType<ConstructStructureOrder>(),
  constructVehicle: ofType<ConstructVehicleOrder>(),
  upgrade: {},
}, {tag: "kind"});
export type Order = UnionOf<typeof OrderUnion>;
export type OrderRecord = typeof OrderUnion._Record;

// `OrderMatchAllCases` is enough to pass to `OrderUnion.match`. Can't be empty.
// Merge `OrderMatchCases` into `OrderMatchAllCases` to extend/override match clauses.
export type OrderMatchCases<T, ReturnValue> = OrderRecordCases<T, ReturnValue> & (OrderDefaultCase<T, ReturnValue> | {});
export type OrderMatchAllCases<T, ReturnValue> = OrderRecordCases<T, ReturnValue> & OrderDefaultCase<T, ReturnValue>;
type OrderRecordCases<T, ReturnValue> = { [O in keyof OrderRecord]?: (value: T, order: OrderRecord[O]) => ReturnValue };
type OrderDefaultCase<T, ReturnValue> = { default: (value: T, order: Order) => ReturnValue };

export interface ManoeuvreOrder {
  destination: Vector;
  context?: IEntityUpdateContext;
}

export interface AttackOrder {
  target: IKillableState;
  context?: IEntityUpdateContext;
}

export interface PatrolOrder {
  location: Vector;
  range?: number;
  context?: IEntityUpdateContext;
}

export interface GuardOrder {
  protectEntity: IEntityState;
  context?: IEntityUpdateContext;
}

export interface ConstructStructureOrder {
  structureClass: any;
  position: Vector;
  metadata?: any;
  context?: IEntityUpdateContext;
}

export interface ConstructVehicleOrder {
  vehicleClass: any;
  metadata?: any;
  context?: IEntityUpdateContext;
}
