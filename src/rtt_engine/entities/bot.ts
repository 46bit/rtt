import { Player, Vector } from '../';
import * as abilities from './abilities';
import { UnitMetadata, IEntityState, Pathfinder, IVehicleMetadata, IVehicleState, newVehicle, vehicleOrderBehaviours } from './';

export type IBotMetadata = IVehicleMetadata;

export interface IBotState extends IVehicleState {
  kind: "bot";
}

export function newBot(position: Vector, player: Player | null): IBotState {
  const kind = "bot";
  return {
    kind,
    ...newVehicle(kind, position, player),
  };
}

export function updateBot(value: IBotState, ctx: {pathfinder: Pathfinder}) {
  if (!value.dead) {
    abilities.updateOrders(value, ctx);
    abilities.updateMovement(value, ctx.pathfinder);
  }
  return value;
}

export const botOrderBehaviours: abilities.OrderMatchAllCases<IBotState, boolean> = {
  ...vehicleOrderBehaviours
};
