import { IEntityState } from '../lib/entity';
import { UnitMetadata, KindsOfUnitsWithAbility } from '../lib/poc';

export type KillableUnits = KindsOfUnitsWithAbility<IKillableMetadata>;
export interface IKillableMetadata {
  fullHealth: number;
}

export interface IKillableState extends IEntityState {
  kind: KillableUnits;
  health: number;
  dead: boolean;
  orders?: any[];
}

export type IKillableEntityFields = Omit<IKillableState, keyof IEntityState>;
export function newKillable<K extends KillableUnits>(kind: K): IKillableEntityFields {
  return {
    health: UnitMetadata[kind].fullHealth,
    dead: false,
  };
}

export function kill<T extends IKillableState>(value: T): T {
  value.dead = true;
  value.health = 0;
  if (value.orders) {
    value.orders = [];
  }
  return value;
}

export function repair<T extends IKillableState>(value: T, amount: number): T {
  value.health = Math.min(value.health + amount, UnitMetadata[value.kind].fullHealth);
  return value;
}

export function damage<T extends IKillableState>(value: T, amount: number): T {
  value.health = Math.max(value.health - amount, 0);
  if (value.health <= 0) {
    value = kill(value);
  }
  return value;
}

export function isDead(value: IKillableState): boolean {
  return value.dead;
}

export function isAlive(value: IKillableState): boolean {
  return !value.dead;
}

export function isDamaged(value: IKillableState): boolean {
  return value.health < UnitMetadata[value.kind].fullHealth;
}

export function healthiness(value: IKillableState): number {
  return value.health / UnitMetadata[value.kind].fullHealth;
}
