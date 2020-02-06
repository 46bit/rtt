import { IMovableConfig, IOwnableConfig, Movable, Ownable } from '../abilities';
import { ISolidEntityConfig, SolidEntity } from './solid_entity';
import { Vector } from '../../vector';

export interface IProjectileConfig extends ISolidEntityConfig, IOwnableConfig, IMovableConfig {
  lifetime: number;
}

export class Projectile extends Ownable(Movable(SolidEntity)) {
  lifetime: number;

  constructor(cfg: IProjectileConfig) {
    super(cfg);
    this.lifetime = cfg.lifetime;
  }

  public update() {
    if (this.dead) {
      return;
    }
    if (this.lifetime <= 0) {
      this.kill();
      return;
    }
    this.lifetime--;
    this.updatePosition();
  }
}
