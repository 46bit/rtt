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
