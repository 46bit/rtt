import {
  Collidable,
  Constructable,
  ICollidableConfig,
  IConstructableConfig,
  IManoeuverableConfig,
  IOwnableConfig,
  Manoeuvrable,
  Ownable,
} from '../abilities';
import { Entity, IEntityConfig } from './entity';

export interface IVehicleConfig extends ICollidableConfig, IConstructableConfig, IManoeuverableConfig, IOwnableConfig, IEntityConfig {
  movementRate: number;
  turnRate: number;
}

export class Vehicle extends Collidable(Constructable(Manoeuvrable(Ownable(Entity)))) {
  public movementRate: number;
  public turnRate: number;

  constructor(cfg: IVehicleConfig) {
    cfg.constructableByMobileUnits = false;
    super(cfg);
    this.movementRate = cfg.movementRate;
    this.turnRate = cfg.turnRate;
  }

  public update() {
    if (this.dead) {
      return;
    }
    // FIXME: Update the velocity too
    this.updateDirection(this.turnRate);
    this.updatePosition(this.movementRate);
  }
}
