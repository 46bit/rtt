import { Entity } from '../types/entity';
import { Vector } from '../../vector';
import { IConstructable } from './constructable';

export interface IEngineerableConfig {
  productionRange: number;
}

export function Engineerable<T extends new(o: any) => any>(Base: T) {
  class Engineerable extends (Base as new(o: any) => Entity) {
    // FIXME: Store velocity as a Vector instead?
    productionRange: number;
    energyProvided: number;
    construction: IConstructable | null;

    constructor(cfg: IEngineerableConfig) {
      super(cfg);
      this.productionRange = cfg.fullHealth;
      this.energyProvided = 0;
      this.construction = null;
    }

    isProducing() {
      return this.construction !== null;
    }

    productionProgress() {
       return this.construction!.healthiness();
    }

    energyConsumption() {
      return this.isProducing() ? 20 : 0;
    }

    isWithinProductionRange(target: Vector) {
      return Vector.subtract(this.position, target).magnitude() <= this.productionRange;
    }

    updateProduction() {
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

  return Engineerable as ComposableConstructor<typeof Engineerable, T>
}
