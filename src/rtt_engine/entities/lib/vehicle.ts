import {
  Collidable,
  Constructable,
  ICollidableConfig,
  IConstructableConfig,
  IManoeuverableConfig,
  IOwnableConfig,
  IOrderableConfig,
  Manoeuvrable,
  Ownable,
  Orderable,
  IKillable,
} from '../abilities';
import { Unit, IUnitConfig } from './unit';
import { Vector } from '../../vector';

export interface IVehicleConfig extends IUnitConfig, IManoeuverableConfig {
  movementRate: number;
  turnRate: number;
}

export class Vehicle extends Manoeuvrable(Unit) {
  public movementRate: number;
  public turnRate: number;
  public route: Vector[] | null;
  public routeTo: Vector | null;

  constructor(cfg: IVehicleConfig) {
    cfg.constructableByMobileUnits = false;
    cfg.orderExecutionCallbacks = {
      'manoeuvre': (manoeuvreOrder: any): boolean => {
        return this.manoeuvre(manoeuvreOrder);
      },
      'attack': (attackOrder: any): boolean => {
        return this.attack(attackOrder);
      },
      'patrol': (patrolOrder: any): boolean => {
        return this.patrol(patrolOrder);
      },
      'guard': (guardOrder: any): boolean => {
        return this.guard(guardOrder);
      }
    };
    super(cfg);
    this.movementRate = cfg.movementRate;
    this.turnRate = cfg.turnRate;
    this.route = null;
    this.routeTo = null;
  }

  public update() {
    if (this.dead) {
      return;
    }
    // FIXME: Drag should be applied after acceleration, but based on the previous velocity?
    this.applyDragForces();
    this.updateOrders();
    this.updateDirection(this.turnRate);
    this.updatePosition(this.movementRate);
  }

  protected manoeuvre(manoeuvreOrder: { destination: Vector }): boolean {
    const distanceToDestination = Vector.subtract(this.position, manoeuvreOrder.destination).magnitude();
    if (distanceToDestination < 10) {
      this.routeTo = null;
      return false;
    }

    if (!this.routeTo || !this.route || this.route.length == 0 || !this.routeTo.equals(manoeuvreOrder.destination) || Math.random() < 0.1) {
      // Find route
      this.routeTo = manoeuvreOrder.destination;
      this.route = window.routeBetween(this.position, this.routeTo);
      //console.log(this.route);
      //this.route?.shift();
    }

    if (!this.route || this.route.length == 0) {
      this.routeTo = null;
      return false;
    }

    let nextRouteDestination = this.route[0];
    let distanceToNextRouteDestination = Vector.subtract(this.position, nextRouteDestination).magnitude();
    while (distanceToNextRouteDestination < 5) {
      this.route.shift();
      if (this.route.length == 0) {
        this.routeTo = null;
        return false;
      }
      nextRouteDestination = this.route[0];
      distanceToNextRouteDestination = Vector.subtract(this.position, nextRouteDestination).magnitude();
    }

    if (this.shouldTurnLeftToReach(nextRouteDestination) && Math.random() > 0.2) {
      this.updateVelocity(-this.physics.turningAngle());
    } else if (this.shouldTurnRightToReach(nextRouteDestination) && Math.random() > 0.2) {
      this.updateVelocity(this.physics.turningAngle());
    } else {
      this.updateVelocity(0);
    }
    return true;
  }

  protected attack(attackOrder: { target: IKillable }): boolean {
    if (attackOrder.target.dead) {
      return false;
    }
    this.manoeuvre({ destination: attackOrder.target.position });
    return true;
  }

  protected patrol(patrolOrder: { location: Vector, range: number }): boolean {
    const distanceToLocation = Vector.subtract(this.position, patrolOrder.location).magnitude();
    if (distanceToLocation <= patrolOrder.range) {
      // FIXME: Circle the location
      this.manoeuvre({ destination: patrolOrder.location });
    } else {
      this.manoeuvre({ destination: patrolOrder.location });
    }
    return true;
  }

  protected guard(guardOrder: { entity: Entity }): boolean {
    throw new Error("guarding units not yet implemented. requires knowing position of enemy units…")
  }
}
