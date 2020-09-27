import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { VehicleController } from '../lib';
import { IEngineer } from '../entities';

export class EngineerController extends VehicleController<IEngineer> {
  updateEntities(entities: IEngineer[], ctx: abilities.IEntityUpdateContext): IEngineer[] {
    return entities;
  }
}

// import { Player } from '../player';
// import { Vector } from '../vector';
// import { Engineerable, ConstructStructureOrder } from './abilities';
// import { Vehicle, IEntityUpdateContext } from './lib';
// import { PowerGenerator, PowerSource } from './';

// export class Engineer extends Engineerable(Vehicle) {
//   constructing: boolean;

//   constructor(position: Vector, direction: number, player: Player, built: boolean) {
//     super({
//       position,
//       direction,
//       collisionRadius: 6,
//       built,
//       buildCost: 50,
//       player,
//       fullHealth: 16,
//       health: built ? 16 : 0,
//       movementRate: 0.06,
//       turnRate: 4.0 / 3.0,
//       productionRange: 25.0,
//       orderBehaviours: {
//         constructStructure: (o: ConstructStructureOrder) => this.constructStructure(o),
//       },
//     } as any);
//     this.constructing = false;
//   }

//   kill() {
//     super.kill();
//   }

//   update(input: {context: IEntityUpdateContext}) {
//     // FIXME: This seems to be updating orders etc twice!
//     super.update(input);
//     if (this.construction != null && (this.construction.isBuilt() || this.construction.isDead())) {
//       this.construction = null;
//     }
//     this.updateProduction();
//     this.updateOrders(input);
//     if (this.construction == null) {
//       this.constructing = false;
//     }
//   }

//   // FIXME: Deduplicate this code with what's on Engineer
//   constructStructure(constructionOrder: ConstructStructureOrder): boolean {
//     if (Vector.subtract(this.position, constructionOrder.position).magnitude() > this.productionRange) {
//       this.manoeuvre({ destination: constructionOrder.position, context: constructionOrder.context });
//       return true;
//     }
//     if (this.construction == null) {
//       if (this.constructing) {
//         this.constructing = false;
//         return false;
//       } else if (constructionOrder.structureClass == PowerGenerator) {
//         const powerSource: PowerSource = constructionOrder.metadata;
//         if (powerSource.structure == null) {
//           this.constructing = true;
//           this.construction = new constructionOrder.structureClass(
//             constructionOrder.position,
//             this.player,
//             false,
//             powerSource,
//           );
//         } else if (powerSource.structure.player == this.player && powerSource.structure.isUnderConstruction()) {
//           this.constructing = true;
//           this.construction = powerSource.structure;
//         } else {
//           return false;
//         }
//       } else {
//         this.constructing = true;
//         this.construction = new constructionOrder.structureClass(
//           constructionOrder.position,
//           this.player,
//           false,
//         );
//         return true;
//       }
//     }
//     return true;
//   }
// }
