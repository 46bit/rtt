import nanoid from 'nanoid';
import { Vector } from '../../vector';

export interface IEntityConfig {
  position: Vector;
}

export interface IEntity {
  id: string;
  position: Vector;
}

export class Entity {
  public id: string;
  public position: Vector;

  constructor(cfg: IEntityConfig) {
    this.id = nanoid();
    this.position = cfg.position;
  }
}
