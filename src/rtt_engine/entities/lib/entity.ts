import { nanoid } from 'nanoid';
import { Vector } from '../../vector';
import { Pathfinder } from '../abilities';

export interface IEntityConfig {
  position: Vector;
}

export interface IEntity {
  id: string;
  position: Vector;
}

export function newEntity(cfg: IEntityConfig): IEntity {
  return {
    id: nanoid(),
    position: cfg.position,
  };
}

export interface IEntityUpdateContext {
  pathfinder: Pathfinder;
}
