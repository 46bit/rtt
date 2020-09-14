import lodash from 'lodash';
import { unionize, ofType, UnionOf } from 'unionize';
import { Vector } from '../../vector';
import { IEntity, Entity, IEntityUpdateContext } from '../lib/entity';
import { IKillable } from './killable';
import { ComposableConstructor } from '../lib/mixins';

export interface IOrderableConfig {
  orderBehaviours?: OrderMatchCases<boolean>;
}

export interface IOrderable extends IEntity {
  orders: Order[];
  orderBehaviours: OrderMatchAllCases<boolean>;
  supportedKindsOfOrders(): string[];
}

export function Orderable<T extends new(o: any) => any>(base: T) {
  class Orderable extends (base as new(o: any) => Entity) {
    public orders: Order[];
    public orderBehaviours: OrderMatchAllCases<boolean>;

    constructor(cfg: IOrderableConfig) {
      super(cfg);
      this.orders = [];
      this.orderBehaviours = {
        default: (_) => false,
        ...cfg.orderBehaviours,
      };
    }

    updateOrders(input: {context: IEntityUpdateContext}) {
      const order = this.orders[0];
      if (order) {
        // FIXME: Add support for arbitrary extra arguments to unionize, and then use that
        // instead of hiding the context in the order
        const orderWithUpdateContext = {...order, context: input.context};
        const orderStillInProgress = OrderUnion.match(orderWithUpdateContext, this.orderBehaviours);
        if (!orderStillInProgress) {
          this.orders.shift();
        }
      }
    }

    supportedKindsOfOrders(): string[] {
      return lodash.keys(this.orderBehaviours);
    }
  }

  return Orderable as ComposableConstructor<typeof Orderable, T>;
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
  protectEntity: Entity;
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
