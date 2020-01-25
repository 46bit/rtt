import { Entity } from '../lib/entity';
import { ComposableConstructor } from '../lib/mixins';

export interface IOrder {
  kind: string;
}

export interface IOrderableConfig {
  orderExecutionCallbacks: {[id: string]: (_: IOrder) => boolean};
}

export interface IOrderable {
  orders: IOrder[];
  orderExecutionCallbacks: {[id: string]: (_: IOrder) => boolean};
}

export function Orderable<T extends new(o: any) => any>(base: T) {
  class Orderable extends (base as new(o: any) => Entity) implements IOrderable {
    public orders: IOrder[];
    public orderExecutionCallbacks: {[id: string]: (_: IOrder) => boolean};

    constructor(cfg: IOrderableConfig) {
      super(cfg);
      this.orders = [];
      this.orderExecutionCallbacks = cfg.orderExecutionCallbacks;
    }

    updateOrders() {
      if (this.orders.length == 0) {
        return;
      }

      const order = this.orders[0];
      const orderExecutionCallback = this.orderExecutionCallbacks[order.kind];
      if (orderExecutionCallback == null) {
        throw new Error("tried to execute order of kind " + order.kind + " but no execution callback was defined on this entity.")
      }
      if (orderExecutionCallback(order) === false) {
        this.orders.shift();
      }
    }
  }

  return Orderable as ComposableConstructor<typeof Orderable, T>;
}
