import { Vector } from '../';
import { nanoid } from 'nanoid';
import { BotMetadata, ShotgunTankMetadata } from '../entities';

export interface IEntity {
  kind: string;
  id: string;
  position: Vector;
}

export function newEntity(cfg: {kind: string, position: Vector}): IEntity {
  const id = nanoid();
  return {id, ...cfg};
}

export const EntityMetadata = {
  bot: BotMetadata,
  shotgunTank: ShotgunTankMetadata,
};
export type EntityMetadataType = typeof EntityMetadata;

export type KindsOfEntities = keyof EntityMetadataType;
export type EntitiesWithMetadata<RequiredMetadata> =
  ({
    [P in KindsOfEntities]:
    EntityMetadataType[P] extends RequiredMetadata ? P : never
  })[KindsOfEntities];
