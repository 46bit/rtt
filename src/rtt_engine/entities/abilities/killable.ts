import { IEntityConfig, IEntity } from '../lib/entity';

export interface IKillableConfig extends IEntityConfig {
  fullHealth: number;
  health: number;
}

export interface IKillable extends IEntity {
  fullHealth: number;
  health: number;
  dead: boolean;
  orders?: any[];
}

export function newKillable<E extends IEntity>(value: E, cfg: IKillableConfig): E & IKillable {
  return {
    ...value,
    fullHealth: cfg.fullHealth,
    health: cfg.health,
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
  value.health = Math.min(value.health + amount, value.fullHealth);
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
  return value.health < value.fullHealth;
}

export function healthiness(value: IKillable): number {
  return value.health / value.fullHealth;;
}
