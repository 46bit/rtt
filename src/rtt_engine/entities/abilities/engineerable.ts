import { Vector } from '../../vector';
import { IEntity, Entity } from '../lib/entity';
import { IConstructable, IKillable, ICollidable, IOwnable } from './';
import { ComposableConstructor } from '../lib/mixins';

export interface IEngineerableConfig {
  productionRange: number;
}

export interface IEngineerable extends IEntity {
  energyProvided: number;
  cooldownBeforeNextConstruction: number;
  construction: (IConstructable & IKillable & ICollidable & IOwnable) | null;

  energyConsumption(): number;
}

export function Engineerable<T extends new(o: any) => any>(base: T) {
  class Engineerable extends (base as new(o: any) => Entity) implements IEngineerable {
    // FIXME: Store velocity as a Vector instead?
    public productionRange: number;
    public energyProvided: number;
    public cooldownBeforeNextConstruction: number;
    public construction: (IConstructable & IKillable & ICollidable & IOwnable) | null;

    constructor(cfg: IEngineerableConfig) {
      super(cfg);
      this.productionRange = cfg.productionRange ?? 0;
      this.energyProvided = 0;
      this.cooldownBeforeNextConstruction = 0;
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
      if (this.cooldownBeforeNextConstruction > 0) {
        this.cooldownBeforeNextConstruction--;
      }

      if (this.construction == null) {
        return;
      }

      if (this.construction!.isDead()) {
        this.construction = null;
        return;
      }

      if (this.construction!.isBuilt()) {
        return;
      }

      if (this.isWithinProductionRange(this.construction!.position)) {
        const healthIncrease = this.energyProvided / this.construction!.buildCostPerHealth();
        this.construction!.repair(healthIncrease);
      }
    }
  }

  return Engineerable as ComposableConstructor<typeof Engineerable, T>;
}
