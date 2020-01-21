import { Entity } from '../types/entity';
import { Vector } from '../../vector';

export interface IKillableConfig {
  fullHealth: number;
  health: number;
}

export interface IKillable {
  fullHealth: number;
  health: number;
  dead: boolean;

  kill(): void;
  repair(amount: number): void;
  damage(amount: number): void;
  isDead(): boolean;
  isAlive(): boolean;
  isDamaged(): boolean;
  healthiness(): number;
}

export function Killable<T extends new(o: any) => any>(Base: T) {
  class Killable extends (Base as new(o: any) => Entity) implements IKillable {
    // FIXME: Store velocity as a Vector instead?
    fullHealth: number;
    health: number;
    dead: boolean;

    constructor(cfg: IKillableConfig) {
      super(cfg);
      this.fullHealth = cfg.fullHealth;
      this.health = cfg.health;
      this.dead = false;
    }

    kill() {
      this.dead = true;
      this.health = 0;
    }

    repair(amount: number) {
      this.health = Math.min(this.health + amount, this.fullHealth);
    }

    damage(amount: number) {
      this.health = Math.max(this.health - amount, 0);
      if (this.health == 0) {
        this.kill();
      }
    }

    isDead() {
      return this.dead;
    }

    isAlive() {
      return !this.dead;
    }

    isDamaged() {
      return this.health < this.fullHealth;
    }

    healthiness() {
      return this.health / this.fullHealth;
    }
  }

  return Killable as ComposableConstructor<typeof Killable, T>
}
