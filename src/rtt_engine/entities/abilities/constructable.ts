import { Entity } from '../lib/entity';
import { IKillable, Killable } from './killable';
import { ComposableConstructor } from '../lib/mixins';

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

export function Constructable<T extends new(o: any) => any>(base: T) {
  class Constructable extends Killable(base as new(o: any) => Entity) implements IConstructable {
    public buildCost: number;
    public built: boolean;
    public constructableByMobileUnits: boolean;

    constructor(cfg: IConstructableConfig) {
      super(cfg);
      this.buildCost = cfg.buildCost;
      this.built = cfg.built;
      this.constructableByMobileUnits = cfg.constructableByMobileUnits;
    }

    public isBuilt() {
      return this.built;
    }

    public isUnderConstruction() {
      return !this.dead && !this.built;
    }

    public buildCostPerHealth() {
      return this.buildCost / this.fullHealth;
    }

    public repair(amount: number) {
      super.repair(amount);
      if (!this.dead && !this.built) {
        this.built = (this.health === this.fullHealth);
      }
    }
  }

  return Constructable as ComposableConstructor<typeof Constructable, T>;
}
