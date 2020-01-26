import { Vector } from '../../vector';
import { Entity } from '../lib/entity';
import { IConstructable } from './constructable';
import { ComposableConstructor } from '../lib/mixins';

export interface IPresenter {
  predraw(): void;
  draw(): void;
  dedraw(): void;
}

export interface IPresentableConfig {
  scene?: THREE.Group;
  newPresenter: null | ((entity: any, scene: THREE.Group) => IPresenter);
}

export function Presentable<T extends new(o: any) => any>(base: T) {
  class Presentable extends (base as new(o: any) => Entity) {
    public presenter?: IPresenter;

    constructor(cfg: IPresentableConfig) {
      super(cfg);
      if (cfg.scene != null && cfg.newPresenter != null) {
        this.presenter = cfg.newPresenter(this, cfg.scene);
      }
    }
  }

  return Presentable as ComposableConstructor<typeof Presentable, T>;
}
