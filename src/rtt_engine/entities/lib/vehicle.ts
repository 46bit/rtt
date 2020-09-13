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
  ManoeuvreOrder,
  AttackOrder,
  PatrolOrder,
  GuardOrder,
} from '../abilities';
import { Unit, IUnitConfig } from './unit';
import { Entity, IEntityUpdateContext } from './entity';
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
    cfg.orderBehaviours = {
      manoeuvre: (o) => this.manoeuvre(o),
      attack: (o) => this.attack(o),
      patrol: (o) => this.patrol(o),
      guard: (o) => this.guard(o),
      ...cfg.orderBehaviours,
    };
    super(cfg);
    this.movementRate = cfg.movementRate;
    this.turnRate = cfg.turnRate;
    this.route = null;
    this.routeTo = null;
  }

  public update(input: {context: IEntityUpdateContext}) {
    if (this.dead) {
      return;
    }
    // FIXME: Drag should be applied after acceleration, but based on the previous velocity?
    this.applyDragForces();
    this.updateOrders(input);
    this.updateDirection(this.turnRate);
    this.updatePosition(this.movementRate);
  }

  protected manoeuvre(manoeuvreOrder: ManoeuvreOrder): boolean {
    const distanceToDestination = Vector.subtract(this.position, manoeuvreOrder.destination).magnitude();
    if (distanceToDestination < 10) {
      this.routeTo = null;
      return false;
    }

    if (!this.routeTo || !this.route || this.route.length == 0 || !this.routeTo.equals(manoeuvreOrder.destination) || Math.random() < 0.1) {
      // Find route
      this.routeTo = manoeuvreOrder.destination;
      this.route = manoeuvreOrder.context!.pathfinder(this.position, this.routeTo);
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

  protected attack(attackOrder: AttackOrder): boolean {
    if (attackOrder.target.dead) {
      return false;
    }
    this.manoeuvre({ destination: attackOrder.target.position, context: attackOrder.context });
    return true;
  }

  protected patrol(patrolOrder: PatrolOrder): boolean {
    if (patrolOrder.range === undefined) {
      patrolOrder.range = this.collisionRadius;
    }
    const distanceToLocation = Vector.subtract(this.position, patrolOrder.location).magnitude();
    if (distanceToLocation <= patrolOrder.range) {
      // FIXME: Circle the location
      this.manoeuvre({ destination: patrolOrder.location, context: patrolOrder.context });
    } else {
      this.manoeuvre({ destination: patrolOrder.location, context: patrolOrder.context });
    }
    return true;
  }

  protected guard(guardOrder: GuardOrder): boolean {
    throw new Error("guarding units not yet implemented. requires knowing position of enemy units…")
  }
}
