import { Player, Vector } from '../';
import * as abilities from './abilities';
import { UnitMetadata, IEntityState, Pathfinder, IVehicleMetadata, VehicleAbilities, IVehicleState, newVehicle, vehicleOrderBehaviours } from './';

export interface IBotMetadata extends IVehicleMetadata {}

// For unclear reasons, anything other than extending a separately-defined type
// transform results in having to cast `IBotState` (e.g., to `as IKillable`)
export type BotAbilities = Omit<VehicleAbilities, "">;
export interface IBotState extends BotAbilities {
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

export const botOrderBehaviours = vehicleOrderBehaviours as abilities.OrderMatchAllCases<IBotState, boolean>;
