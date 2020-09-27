import lodash from 'lodash';
import { Vector } from '..';
import { IEntity, Controller } from '../lib';
import { unionize, ofType, UnionOf } from 'unionize';
import { IKillableEntity, IEntityUpdateContext } from '.';

export interface IOrderableEntity extends IEntity {
  orders: Order[];
}

export abstract class OrderableController<E extends IOrderableEntity> extends Controller<E> {
  updateOrders(entity: E, ctx: IEntityUpdateContext): E {
    // FIXME: Maybe this should be partial based on what the entity supports,
    // but that's a bit complex to implement and has little value
    OrderUnion.match(entity.orders[0], {
      manoeuvre: (o: ManoeuvreOrder) => this.updateManoeuvreOrder(entity, o, ctx),
      attack: (o: AttackOrder) => this.updateAttackOrder(entity, o, ctx),
      patrol: (o: PatrolOrder) => this.updatePatrolOrder(entity, o, ctx),
      guard: (o: GuardOrder) => this.updateGuardOrder(entity, o, ctx),
      constructStructure: (o: ConstructStructureOrder) => this.updateConstructStructureOrder(entity, o, ctx),
      constructVehicle: (o: ConstructVehicleOrder) => this.updateConstructVehicleOrder(entity, o, ctx),
      upgrade: (o: {}) => this.updateUpgradeOrder(entity, ctx),
    } as OrderMatchExhaustiveCases<boolean>);
    return entity;
  }

  updateManoeuvreOrder(entity: E, order: ManoeuvreOrder, ctx: IEntityUpdateContext): boolean {
    return false;
  }

  updateAttackOrder(entity: E, order: AttackOrder, ctx: IEntityUpdateContext): boolean {
    return false;
  }

  updatePatrolOrder(entity: E, order: PatrolOrder, ctx: IEntityUpdateContext): boolean {
    return false;
  }

  updateGuardOrder(entity: E, order: GuardOrder, ctx: IEntityUpdateContext): boolean {
    return false;
  }

  updateConstructStructureOrder(entity: E, order: ConstructStructureOrder, ctx: IEntityUpdateContext): boolean {
    return false;
  }

  updateConstructVehicleOrder(entity: E, order: ConstructVehicleOrder, ctx: IEntityUpdateContext): boolean {
    return false;
  }

  updateUpgradeOrder(entity: E, ctx: IEntityUpdateContext): boolean {
    return false;
  }
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
export type OrderMatchCases<ReturnValue> = OrderRecordSomeCases<ReturnValue> & (OrderDefaultCase<ReturnValue> | {});
export type OrderMatchExhaustiveCases<ReturnValue> = OrderRecordAllCases<ReturnValue>;
export type OrderMatchAllCases<ReturnValue> = OrderRecordAllCases<ReturnValue> | (OrderRecordSomeCases<ReturnValue> & OrderDefaultCase<ReturnValue>);
type OrderRecordSomeCases<ReturnValue> = { [O in keyof OrderRecord]?: (order: OrderRecord[O]) => ReturnValue };
type OrderRecordAllCases<ReturnValue> = { [O in keyof OrderRecord]: (order: OrderRecord[O]) => ReturnValue };
type OrderDefaultCase<ReturnValue> = { default: (order: Order) => ReturnValue };

export interface ManoeuvreOrder {
  destination: Vector;
}

export interface AttackOrder {
  target: IKillableEntity;
}

export interface PatrolOrder {
  location: Vector;
  range?: number;
}

export interface GuardOrder {
  protectEntity: IEntity;
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
