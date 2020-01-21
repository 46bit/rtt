import { IEntityConfig, Entity } from './entity';
import { ICollidableConfig, Collidable } from '../capabilities/collidable';

export interface IPointOfInterestConfig extends ICollidableConfig, IEntityConfig {}

export class PointOfInterest<S> extends Collidable(Entity) {
  structure: S | null;

  constructor(cfg: IPointOfInterestConfig) {
    super(cfg);
    this.structure = null;
  }
}
