import lodash from 'lodash';
import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { VehicleController } from '../lib/vehicle';
import { ProjectileController } from '../lib/projectile';
import { Models, IEntity } from '../lib';
import { ITitan, ITitanProjectile } from '../entities';

export class TitanController extends VehicleController<ITitan> {
  updateEntities(entities: ITitan[], ctx: abilities.IEntityUpdateContext): ITitan[] {
    return entities.map((e) => this.updateEntity(e, ctx));
  }

  updateEntity(entity: ITitan, ctx: abilities.IEntityUpdateContext): ITitan {
    return this.updateOrders(entity, ctx);
  }
}

export class TitanProjectileController extends ProjectileController<ITitanProjectile> { }

//     this.turret2 = new VehicleTurret(0.05, 1, 0.8, 0);
//     this.turret2.rotation = this.direction;
//     this.laserStopAfter = undefined;
//   }

//   update(input: {enemies: (IKillable & ICollidable)[], context: IEntityUpdateContext}) {
//     if (this.dead) {
//       return;
//     }
//     super.update(input);

//     this.laserStopAfter = undefined;
//     const angleToFireProjectile = this.angleToNearestEnemy(input.enemies);
//     if (angleToFireProjectile == null) {
//       this.turret2.update(this.direction);
//       return;
//     }
//     this.turret2.updateTowards(0, angleToFireProjectile[0]);

//     if (angleToFireProjectile[1] < TITAN_RANGE) {
//       let p = this.position.clone();
//       let u = Vector.from_magnitude_and_direction(1, this.turret2.rotation);
//       for (let d = 0; d < TITAN_RANGE; d++) {
//         p.add(u);
//         let hitEnemies = input.enemies.filter((e) => !e.dead && Vector.distance(e.position, p) < e.collisionRadius);
//         if (hitEnemies.length > 0) {
//           for (let hitEnemy of hitEnemies) {
//             hitEnemy.damage(3 / hitEnemies.length);
//           }
//           this.laserStopAfter = d;
//           break;
//         }
//       }
//     }
//   }

//   protected angleToNearestEnemy(enemies: IEntity[]): [number, number] | null {
//     const nearestEnemy = lodash.minBy(enemies, (e) => Vector.subtract(this.position, e.position).magnitude());
//     if (nearestEnemy == null) {
//       return null;
//     }
//     const offset = Vector.subtract(nearestEnemy.position, this.position);
//     if (offset.magnitude() > TITAN_RANGE * 2) {
//       return null;
//     }
//     return [offset.angle(), offset.magnitude()];
//   }

//   protected attack(attackOrder: AttackOrder): boolean {
//     if (attackOrder.target.dead) {
//       return false;
//     }
//     const distance = Vector.subtract(this.position, attackOrder.target.position).magnitude();
//     if (distance > TITAN_RANGE) {
//       this.manoeuvre({ destination: attackOrder.target.position, context: attackOrder.context });
//     }
//     return true;
//   }
// }
