import { nanoid } from 'nanoid';
import { Vector } from '../../vector';
import { Pathfinder } from '../abilities';
import { KindsOfUnits } from '../lib/poc';

export interface IEntityMetadata {}
export interface IEntityState {
  kind: any;
  id: string;
  position: Vector;
}

export function newEntity<K>(cfg: {kind: K, position: Vector}): IEntityState {
  return {
    kind: cfg.kind,
    id: nanoid(),
    position: cfg.position,
  };
}

export interface IEntityUpdateContext {
  pathfinder: Pathfinder;
}
