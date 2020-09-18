import { nanoid } from 'nanoid';
import { Vector } from '../../vector';
import { Pathfinder } from '../abilities';
import { KindsOfUnits } from '../lib/poc';

export interface IEntity<K extends KindsOfUnits> {
  id: string;
  kind: K;
  position: Vector;
}

export function newEntity<K extends KindsOfUnits>(cfg: {kind: K, position: Vector}): IEntity<K> {
  return {
    id: nanoid(),
    kind: cfg.kind,
    position: cfg.position,
  };
}

export interface IEntityUpdateContext {
  pathfinder: Pathfinder;
}
