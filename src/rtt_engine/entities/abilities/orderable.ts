import lodash from 'lodash';
import { unionize, ofType, UnionOf } from 'unionize';
import { Vector } from '../../vector';
import { IKillableConfig, IKillable, newKillable } from './killable';
import { IEntity, IEntityUpdateContext, newEntity } from '../lib/entity';
import { UnitMetadata, KindsOfUnitsWithAbility } from '../lib/poc';

export interface IOrderableConfig extends IKillableConfig {
  orderBehaviours: OrderMatchCases<boolean>;
}

export type OrderableUnits = KindsOfUnitsWithAbility<IOrderableConfig>;

export interface IOrderable extends IKillable {
  kind: OrderableUnits;
  orders: Order[];
}

export type FieldsOfIOrderable = Omit<IOrderable, "kind">;

export function newOrderable<K extends OrderableUnits, E extends IEntity<K>>(value: E): E & FieldsOfIOrderable {
  return {...newKillable(value), orders: []};
}

export function updateOrders<E extends IOrderable>(value: E, input: {context: IEntityUpdateContext}): E {
  const order = value.orders[0];
  if (order) {
    // FIXME: Add support for arbitrary extra arguments to unionize, and then use that
    // instead of hiding the context in the order
    const orderWithUpdateContext = {...order, context: input.context};
    const orderStillInProgress = OrderUnion.match(orderWithUpdateContext, UnitMetadata[value.kind].orderBehaviours);
    if (!orderStillInProgress) {
      value.orders.shift();
    }
  }
  return value;
}

export function supportedKindsOfOrders(value: IOrderable): string[] {
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
export type OrderMatchCases<ReturnValue> = OrderRecordCases<ReturnValue> & (OrderDefaultCase<ReturnValue> | {});
export type OrderMatchAllCases<ReturnValue> = OrderRecordCases<ReturnValue> & OrderDefaultCase<ReturnValue>;
type OrderRecordCases<ReturnValue> = { [T in keyof OrderRecord]?: (_: OrderRecord[T]) => ReturnValue };
type OrderDefaultCase<ReturnValue> = { default: (_: Order) => ReturnValue };

export interface ManoeuvreOrder {
  destination: Vector;
  context?: IEntityUpdateContext;
}

export interface AttackOrder {
  target: IKillable;
  context?: IEntityUpdateContext;
}

export interface PatrolOrder {
  location: Vector;
  range?: number;
  context?: IEntityUpdateContext;
}

export interface GuardOrder {
  protectEntity: IEntity;
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
