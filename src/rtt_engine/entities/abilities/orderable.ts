import lodash from 'lodash';
import { unionize, ofType, UnionOf } from 'unionize';
import { Vector } from '../../vector';
import { Entity } from '../lib/entity';
import { IKillable } from './killable';
import { ComposableConstructor } from '../lib/mixins';

export interface IOrderableConfig {
  orderBehaviours: OrderMatchCases<boolean>;
}

export interface IOrderable {
  orders: Order[];
  orderBehaviours: OrderMatchCases<boolean>;
  supportedKindsOfOrders(): string[];
}

export function Orderable<T extends new(o: any) => any>(base: T) {
  class Orderable extends (base as new(o: any) => Entity) {
    public orders: Order[];
    public orderBehaviours: OrderMatchCases<boolean>;

    constructor(cfg: IOrderableConfig) {
      super(cfg);
      this.orders = [];
      this.orderBehaviours = cfg.orderBehaviours;
      this.orders[0] = OrderUnion.manoeuvre({ destination: new Vector(1, 2) });
    }

    updateOrders() {
      const order = this.orders[0];
      if (order) {
        const orderStillInProgress = OrderUnion.match(order, this.orderBehaviours);
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
export type OrderMatchCases<ReturnValue> = Parameters<typeof OrderUnion.match>[1];

export interface ManoeuvreOrder {
  destination: Vector;
}

export interface AttackOrder {
  target: IKillable;
}

export interface PatrolOrder {
  location: Vector;
  range?: number;
}

export interface GuardOrder {
  protectEntity: Entity;
}

export interface ConstructStructureOrder {
  structureClass: any;
  position: Vector;
  metadata?: any;
}

export interface ConstructVehicleOrder {
  vehicleClass: any;
  metadata?: any;
}
