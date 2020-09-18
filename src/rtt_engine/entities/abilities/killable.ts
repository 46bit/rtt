import { IEntity } from '../lib/entity';
import { UnitMetadata, KindsOfUnitsWithAbility } from '../lib/poc';

export interface IKillableConfig {
  fullHealth: number;
}

export type KindsOfUnitsThatAreKillable = KindsOfUnitsWithAbility<IKillableConfig>;

export interface IKillable extends IEntity<KindsOfUnitsThatAreKillable> {
  health: number;
  dead: boolean;
  orders?: any[];
}

export type FieldsOfIKillable = Omit<IKillable, "kind">;

export function newKillable<K extends KindsOfUnitsThatAreKillable, E extends IEntity<K>>(value: E): E & FieldsOfIKillable {
  return {
    ...value,
    health: UnitMetadata[value.kind].fullHealth,
    dead: false,
  };
}

export function kill<E extends IKillable>(value: E): E {
  value.dead = true;
  value.health = 0;
  if (value.orders) {
    value.orders = [];
  }
  return value;
}

export function repair<E extends IKillable>(value: E, amount: number): E {
  value.health = Math.min(value.health + amount, UnitMetadata[value.kind].fullHealth);
  return value;
}

export function damage<E extends IKillable>(value: E, amount: number): E {
  value.health = Math.max(value.health - amount, 0);
  if (value.health <= 0) {
    value = kill(value);
  }
  return value;
}

export function isDead(value: IKillable): boolean {
  return value.dead;
}

export function isAlive(value: IKillable): boolean {
  return !value.dead;
}

export function isDamaged(value: IKillable): boolean {
  return value.health < UnitMetadata[value.kind].fullHealth;
}

export function healthiness(value: IKillable): number {
  return value.health / UnitMetadata[value.kind].fullHealth;
}
