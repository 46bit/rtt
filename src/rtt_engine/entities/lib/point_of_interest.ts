import { ICollidableConfig, ICollidable, newCollidable } from '../abilities/collidable';
import { IEntityConfig, IEntity, newEntity } from './entity';

export type IPointOfInterestConfig = ICollidableConfig;

export interface IPointOfInterest<S> extends ICollidable {
  structure: S | null;
}

export function newPointOfInterest<S>(cfg: IPointOfInterestConfig): IPointOfInterest<S> {
  return {
    ...newCollidable(newEntity(cfg), cfg),
    structure: null,
  };
}
