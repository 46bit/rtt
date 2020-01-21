import { Entity } from '../types/entity';

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

export function Killable<T extends new(o: any) => any>(base: T) {
  class Killable extends (base as new(o: any) => Entity) implements IKillable {
    // FIXME: Store velocity as a Vector instead?
    public fullHealth: number;
    public health: number;
    public dead: boolean;

    constructor(cfg: IKillableConfig) {
      super(cfg);
      this.fullHealth = cfg.fullHealth;
      this.health = cfg.health;
      this.dead = false;
    }

    public kill() {
      this.dead = true;
      this.health = 0;
    }

    public repair(amount: number) {
      this.health = Math.min(this.health + amount, this.fullHealth);
    }

    public damage(amount: number) {
      this.health = Math.max(this.health - amount, 0);
      if (this.health === 0) {
        this.kill();
      }
    }

    public isDead() {
      return this.dead;
    }

    public isAlive() {
      return !this.dead;
    }

    public isDamaged() {
      return this.health < this.fullHealth;
    }

    public healthiness() {
      return this.health / this.fullHealth;
    }
  }

  return Killable as ComposableConstructor<typeof Killable, T>;
}
