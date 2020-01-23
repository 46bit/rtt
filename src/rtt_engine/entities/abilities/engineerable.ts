import { Vector } from '../../vector';
import { Entity } from '../lib/entity';
import { IConstructable } from './constructable';
import { ComposableConstructor } from '../lib/mixins';

export interface IEngineerableConfig {
  productionRange: number;
}

export function Engineerable<T extends new(o: any) => any>(base: T) {
  class Engineerable extends (base as new(o: any) => Entity) {
    // FIXME: Store velocity as a Vector instead?
    public productionRange: number;
    public energyProvided: number;
    public construction: IConstructable | null;

    constructor(cfg: IEngineerableConfig) {
      super(cfg);
      this.productionRange = cfg.fullHealth;
      this.energyProvided = 0;
      this.construction = null;
    }

    public isProducing() {
      return this.construction !== null;
    }

    public productionProgress() {
       return this.construction!.healthiness();
    }

    public energyConsumption() {
      return this.isProducing() ? 20 : 0;
    }

    public isWithinProductionRange(target: Vector) {
      return Vector.subtract(this.position, target).magnitude() <= this.productionRange;
    }

    public updateProduction() {
      if (this.construction === null) {
        return;
      }

      if (this.construction!.isDead()) {
        this.construction = null;
        return;
      }

      if (this.isWithinProductionRange(this.construction!.position)) {
        this.construction!.repair(this.energyProvided / this.construction!.costPerHealth());
      }

      if (this.construction!.isBuilt()) {
        this.construction = null;
      }
    }
  }

  return Engineerable as ComposableConstructor<typeof Engineerable, T>;
}
