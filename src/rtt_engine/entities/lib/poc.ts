import lodash from 'lodash';
import { unionize, ofType, UnionOf } from 'unionize';

export const UnitUnion = unionize({
  artilleryTank: ofType<IArtilleryTank>(),
  bot: ofType<IBot>(),
  commander: ofType<ICommander>(),
  engineer: ofType<IEngineer>(),
  factory: ofType<IFactory>(),
  powerGenerator: ofType<IPowerGenerator>(),
  shotgunTank: ofType<IShotgunTank>(),
  Titan: ofType<ITitan>(),
  Turret: ofType<ITurret>(),
}, {tag: "kind"});
export type Unit = UnionOf<typeof UnitUnion>;
export type UnitRecord = typeof UnitUnion._Record;

type MetadataForUnits = {[kind in keyof UnitRecord]: {[key: string]: any}};
export const UnitMetadata: MetadataForUnits = {
  artilleryTank: {
    collisionRadius: 9,
    buildCost: 500,
    fullHealth: 50,
    movementRate: 0.04,
    turnRate: 4.0 / 3.0,
    firingRate: 75,
  },
  bot: {
    collisionRadius: 5,
    buildCost: 70,
    fullHealth: 10,
    movementRate: 0.15,
    turnRate: 5.0 / 3.0,
    productionRange: 25.0,
  },
  commander: {
    collisionRadius: 8,
    buildCost: 10000,
    fullHealth: 1000,
    health: 1000,
    movementRate: 0.03,
    turnRate: 2.0 / 3.0,
    productionRange: 35.0,
    energyOutput: 5,
  },
  engineer: {
    collisionRadius: 6,
    buildCost: 50,
    fullHealth: 16,
    movementRate: 0.06,
    turnRate: 4.0 / 3.0,
    productionRange: 25.0,
  },
  factory: {
    collisionRadius: 15,
    buildCost: 1200,
    fullHealth: 120,
  },
  powerGenerator: {
    collisionRadius: 8,
    buildCost: 300,
    fullHealth: 60,
  },
  shotgunTank: {
    collisionRadius: 8,
    buildCost: 400,
    fullHealth: 35,
    movementRate: 0.07,
    turnRate: 4.0 / 3.0,
    firingRate: 40,
    turretInput: [0.08, 1, 0.8],
  },
  titan: {
    collisionRadius: 12,
    buildCost: 7000,
    fullHealth: 700,
    movementRate: 0.03,
    turnRate: 1 / 3,
    turretInput: [0.05, 1, 0.8, 0],
  },
  turret: {
    collisionRadius: 5,
    buildCost: 600,
    fullHealth: 60,
    constructableByMobileUnits: true,
    firingRate: 5,
  },
};

interface IArtilleryTank {

}

interface IBot {

}

interface ICommander {

}

interface IEngineer {

}

interface IFactory {

}

interface IPowerGenerator {

}

interface IShotgunTank {

}

interface ITitan {

}

interface ITurret {

}
