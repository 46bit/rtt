import { Vector } from '../';
import * as abilities from './abilities';
import { IEntityMetadata, IEntityState, IPowerGeneratorState, newEntity } from './';

export type IPowerSourceMetadata = IEntityMetadata & abilities.ICollidableMetadata;
export type PowerSourceAbilities = IEntityState & abilities.ICollidableState;

export interface IPowerSourceState extends PowerSourceAbilities {
  kind: "powerSource";
  structure: IPowerGeneratorState | null;
}

export function newPowerSource(position: Vector): IPowerSourceState {
  const kind = "powerSource";
  return {
    ...newEntity({kind, position}),
    structure: null,
  };
}
