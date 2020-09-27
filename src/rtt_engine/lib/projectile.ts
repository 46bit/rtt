import { Vector, Player } from '../../';
import * as abilities from '../abilities';
import { UnitMetadata, KindsOfUnitsWithAbility, ISolidEntityMetadata, SolidEntityAbilities, newSolidEntity } from './';
import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { Controller, EntityMetadata, EntitiesWithMetadata, Models } from '.';

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
