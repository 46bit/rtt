import { IEntityConfig, Entity } from './entity';
import {
  ICollidableConfig,
  Collidable,
  IConstructableConfig,
  Constructable,
  IManoeuverableConfig,
  Manoeuvrable,
  IOwnableConfig,
  Ownable
} from '../capabilities';

export interface IVehicleConfig extends ICollidableConfig, IConstructableConfig, IManoeuverableConfig, IOwnableConfig, IEntityConfig {
  movementRate: number;
  turnRate: number;
}

export class Vehicle extends Collidable(Constructable(Manoeuvrable(Ownable(Entity)))) {
  movementRate: number;
  turnRate: number;

  constructor(cfg: IVehicleConfig) {
    cfg.constructableByMobileUnits = false;
    super(cfg);
    this.movementRate = cfg.movementRate;
    this.turnRate = cfg.turnRate;
  }

  update() {
    if (this.dead) {
      return;
    }
    // FIXME: Update the velocity too
    this.updateDirection(this.turnRate);
    this.updatePosition(this.movementRate);
  }
}
