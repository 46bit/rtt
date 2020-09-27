import lodash from 'lodash';
import { Vector } from '..';
import { IEntity } from '../lib';
import { unionize, ofType, UnionOf } from 'unionize';
import { IKillableEntity, IEntityUpdateContext } from '.';

export interface IOrderableState extends IEntity {
  orders: Order[];
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
  target: IKillableEntity;
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
