import { Player, Vector } from '../';
import * as abilities from './abilities';
import { IVehicleMetadata, IVehicleState, newVehicle } from './';

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
