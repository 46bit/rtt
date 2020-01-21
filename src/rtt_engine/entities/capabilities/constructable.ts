import { Entity } from '../types/entity';
import { Vector } from '../../vector';
import { Killable, IKillable } from './killable';

export interface IConstructableConfig {
  built: boolean;
  buildCost: number;
  constructableByMobileUnits: boolean;
}

export interface IConstructable extends IKillable {
  buildCost: number;
  built: boolean;

  isBuilt(): boolean;
  isUnderConstruction(): boolean;
  buildCostPerHealth(): number;
  repair(amount: number): void;
}

export function Constructable<T extends new(o: any) => any>(Base: T) {
  class Constructable extends Killable(Base as new(o: any) => Entity) implements IConstructable {
    buildCost: number;
    built: boolean;
    constructableByMobileUnits: boolean;

    constructor(cfg: IConstructableConfig) {
      super(cfg);
      this.buildCost = cfg.buildCost;
      this.built = cfg.built;
      this.constructableByMobileUnits = cfg.constructableByMobileUnits;
    }

    isBuilt() {
      return this.built;
    }

    isUnderConstruction() {
      return !this.dead && !this.built;
    }

    buildCostPerHealth() {
      return this.buildCost / this.fullHealth;
    }

    repair(amount: number) {
      super.repair(amount);
      if (!this.dead && !this.built) {
        this.built = (this.health == this.fullHealth);
      }
    }
  }

  return Constructable as ComposableConstructor<typeof Constructable, T>
}
