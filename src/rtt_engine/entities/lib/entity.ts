import { nanoid } from 'nanoid';
import { Vector } from '../../vector';
import { Pathfinder } from '../abilities';
import { EntityMetadataType } from '../../lib';

// export interface IEntityMetadata {}
// export interface IEntityState {
//   kind: keyof EntityMetadataType;
//   id: string;
//   position: Vector;
// }

// export function newEntity<K extends EntityMetadataType>(cfg: {kind: K, position: Vector}): IEntityState & {kind: K} {
//   return {
//     kind: cfg.kind,
//     id: nanoid(),
//     position: cfg.position,
//   };
// }

export interface IEntityUpdateContext {
  pathfinder: Pathfinder;
  nearbyEnemies: IEntity[];
}
