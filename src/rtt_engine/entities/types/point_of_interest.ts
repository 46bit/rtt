import { Collidable, ICollidableConfig } from '../capabilities/collidable';
import { Entity, IEntityConfig } from './entity';

export interface IPointOfInterestConfig extends ICollidableConfig, IEntityConfig {}

export class PointOfInterest<S> extends Collidable(Entity) {
  public structure: S | null;

  constructor(cfg: IPointOfInterestConfig) {
    super(cfg);
    this.structure = null;
  }
}
