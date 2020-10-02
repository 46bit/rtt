import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { KillableModel } from '../abilities/killable';
import { OwnableModel } from '../abilities/ownable';
import { MovableModel } from '../abilities/movable';
import { EntityMetadata, EntitiesWithMetadata, Models, newEntity } from '.';
import { Model } from './model';
import { Controller } from './controller';

export type ProjectileAbilities = abilities.ICollidableEntity & abilities.IKillableEntity & abilities.IOwnableEntity & abilities.IMovableEntity;

export interface IProjectileEntity extends ProjectileAbilities {
  kind: ProjectileAbilities["kind"] & EntitiesWithMetadata<IProjectileMetadata>;
  remainingLifetime: number;
}

export interface IProjectileMetadata {
  lifetime: number;
  velocity: number;
}

export abstract class ProjectileController<E extends IProjectileEntity> extends Controller<E> {
  updateEntity(entity: E, ..._: any): E {
    return this.updateProjectile(entity);
  }

  updateProjectile(entity: E): E {
    if (entity.dead) {
      return entity;
    }
    if (entity.remainingLifetime <= 0) {
      Models[entity.kind].kill(entity);
      return entity;
    }
    entity.remainingLifetime--;
    Models[entity.kind].updatePosition(entity);
    return entity;
  }
}

export abstract class ProjectileModel<E extends IProjectileEntity> extends KillableModel(
    OwnableModel(
      MovableModel(Model))) {
  newProjectileEntity(cfg: {kind: E["kind"], position: Vector, direction: number, player: Player}): IProjectileEntity & {kind: E["kind"]} {
    return {
      ...newEntity({kind: cfg.kind, position: cfg.position}),
      health: EntityMetadata[cfg.kind].fullHealth,
      dead: false,
      player: cfg.player,
      velocity: EntityMetadata[cfg.kind].velocity,
      direction: cfg.direction,
      remainingLifetime: EntityMetadata[cfg.kind].lifetime,
    };
  }
}
