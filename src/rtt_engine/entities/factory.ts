import { newPhysics } from '.';
import * as abilities from '../abilities';

export interface IFactory extends abilities.IConstructableEntity, abilities.IOwnableEntity, abilities.ICollidableEntity, abilities.IEngineerEntity {
  kind: "factory";
}

export const FactoryMetadata = {
  collisionRadius: 15,
  buildCost: 1200,
  constructableByMobileUnits: true,
  productionRange: 0,
  fullHealth: 120,
};

// export class Factory extends Orderable(Engineerable(Structure)) {
//   constructing: boolean;

//   constructor(position: Vector, player: Player, built: boolean) {
//     super({
//       position,
//       collisionRadius: 15,
//       player,
//       built,
//       buildCost: 1200,
//       fullHealth: 120,
//       health: built ? 120 : 0,
//       orderBehaviours: {
//         constructVehicle: (o: any) => this.constructVehicle(o),
//       },
//     } as any);
//     this.constructing = false;
//   }

//   kill() {
//     super.kill();
//     this.construction?.kill();
//   }

//   update(input: {context: IEntityUpdateContext}) {
//     if (this.construction != null && this.construction.isBuilt()) {
//       this.construction = null;
//     }
//     this.updateProduction();
//     this.updateOrders(input);
//     if (this.construction == null) {
//       this.constructing = false;
//     }
//   }

//   constructVehicle(constructionOrder: ConstructVehicleOrder): boolean {
//     if (this.construction == null) {
//       if (this.constructing) {
//         this.constructing = false;
//         return false;
//       } else {
//         this.constructing = true;
//         this.construction = new constructionOrder.vehicleClass(
//           this.position.clone(),
//           Math.random() * Math.PI * 2,
//           this.player,
//           false,
//         );
//         return true;
//       }
//     }
//     return true;
//   }
// }
