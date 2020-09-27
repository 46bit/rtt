import { newPhysics } from '.';
import * as abilities from '../abilities';

export interface ICommander extends abilities.IConstructableEntity, abilities.IOwnableEntity, abilities.ICollidableEntity, abilities.IEngineerEntity, abilities.IPathableEntity {
  kind: "commander";
}

export const CommanderMetadata = {
  collisionRadius: 8,
  buildCost: 10000,
  constructableByMobileUnits: false,
  fullHealth: 1000,
  movementRate: 0.03,
  turnRate: 2.0 / 3.0,
  physics: newPhysics(),
  productionRange: 35.0,
  energyOutput: 5,
};

//   update(input: {context: IEntityUpdateContext}) {
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
