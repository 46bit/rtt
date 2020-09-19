import { Vector, Player } from '../../';
import * as abilities from '../abilities';
import { UnitMetadata, KindsOfUnitsWithAbility, ISolidEntityMetadata, SolidEntityAbilities, newSolidEntity } from './';

export type ProjectileUnits = KindsOfUnitsWithAbility<IProjectileMetadata>;
export type IProjectileMetadata =
  ISolidEntityMetadata
  & abilities.IMovableMetadata
  & {lifetime: number, velocity: number};
export type ProjectileAbilities =
  SolidEntityAbilities
  & abilities.IMovableState;

export interface IProjectileState extends ProjectileAbilities {
  remainingLifetime: number;
}

export function newProjectile(kind: ProjectileUnits, position: Vector, direction: number, player: Player | null): IProjectileState {
  return {
    ...newSolidEntity(kind, position, player),
    ...abilities.newMovable(kind, {
      direction,
      velocity: UnitMetadata[kind].velocity,
    }),
    remainingLifetime: UnitMetadata[kind].lifetime,
  };
}

export function updateProjectile<T extends IProjectileState>(value: T): T {
  if (value.dead) {
    return value;
  }
  if (value.remainingLifetime <= 0) {
    abilities.kill(value);
    return value;
  }
  value.remainingLifetime--;
  abilities.updatePosition(value);
  return value;
}
