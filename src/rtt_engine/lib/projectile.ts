import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { Controller, EntityMetadata, EntitiesWithMetadata, Models, Model, newEntity } from '.';

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
  updateEntities(entities: E[]): E[] {
    return entities.map((e) => this.updateProjectile(e));
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

export abstract class ProjectileModel<E extends IProjectileEntity> extends abilities.KillableModel(
    abilities.OwnableModel(
      abilities.MovableModel(Model))) {
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
