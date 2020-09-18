import { IEntity } from '../lib/entity';
import { UnitMetadata, KindsOfUnitsWithAbility } from '../lib/poc';

export interface IKillableConfig {
  fullHealth: number;
}

export type KillableUnits = KindsOfUnitsWithAbility<IKillableConfig>;

export interface IKillable<K extends KillableUnits> extends IEntity<K> {
  health: number;
  dead: boolean;
  orders?: any[];
}

export type Killable = IKillable<KillableUnits>;

export function newKillable<E extends IEntity<KillableUnits>>(value: E): IKillable<KillableUnits> {
  return {
    ...value,
    health: UnitMetadata[value.kind].fullHealth,
    dead: false,
  };
}

export function kill<E extends Killable>(value: E): E {
  value.dead = true;
  value.health = 0;
  if (value.orders) {
    value.orders = [];
  }
  return value;
}

export function repair<E extends Killable>(value: E, amount: number): E {
  value.health = Math.min(value.health + amount, UnitMetadata[value.kind].fullHealth);
  return value;
}

export function damage<E extends Killable>(value: E, amount: number): E {
  value.health = Math.max(value.health - amount, 0);
  if (value.health <= 0) {
    value = kill(value);
  }
  return value;
}

export function isDead(value: Killable): boolean {
  return value.dead;
}

export function isAlive(value: Killable): boolean {
  return !value.dead;
}

export function isDamaged(value: Killable): boolean {
  return value.health < UnitMetadata[value.kind].fullHealth;
}

export function healthiness(value: Killable): number {
  return value.health / UnitMetadata[value.kind].fullHealth;
}
