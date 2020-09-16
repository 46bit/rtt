import {
  IMovable,
  IMovableConfig,
  newMovable,
  IOwnable,
  IOwnableConfig,
  newOwnable,
  kill,
  updatePosition,
} from '../abilities';
import { ISolidEntityConfig, ISolidEntity, newSolidEntity } from './solid_entity';

export interface IProjectileConfig extends ISolidEntityConfig, IMovableConfig, IOwnableConfig {
  lifetime: number;
}

export interface IProjectile extends ISolidEntity, IMovable, IOwnable {
  lifetime: number;
}

export function newProjectile(cfg: IProjectileConfig): IProjectile {
  return {
    ...newOwnable(newMovable(newSolidEntity(cfg), cfg), cfg),
    lifetime: cfg.lifetime,
  };
}

export function updateProjectile<E extends IProjectile>(value: E): E {
  if (value.dead) {
    return value;
  }
  if (value.lifetime <= 0) {
    kill(value);
    return value;
  }
  value.lifetime--;
  updatePosition(value);
  return value;
}
