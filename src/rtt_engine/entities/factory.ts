import * as abilities from '../abilities';

export type FactoryAbilities = abilities.IConstructableEntity & abilities.IOwnableEntity & abilities.ICollidableEntity & abilities.IEngineerEntity & abilities.IOrderableEntity;
export interface IFactory extends FactoryAbilities {
  kind: "factory";
}

export const FactoryMetadata = {
  collisionRadius: 15,
  buildCost: 1200,
  constructableByMobileUnits: true,
  productionRange: 1,
  fullHealth: 120,
};
