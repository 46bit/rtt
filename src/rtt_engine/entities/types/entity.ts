import { Vector } from '../../vector';

export interface IEntityConfig {
  position: Vector;
}

export class Entity {
  public position: Vector;

  constructor(cfg: IEntityConfig) {
    this.position = cfg.position;
  }
}
