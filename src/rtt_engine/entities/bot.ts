import { newPhysics } from '.';
import * as abilities from '../abilities';

export const IBotKind = "bot";

export interface IBot extends abilities.IKillableEntity {
  kind: typeof IBotKind;
}

export const BotMetadata = {
  collisionRadius: 5,
  buildCost: 70,
  constructableByMobileUnits: false,
  fullHealth: 10,
  movementRate: 0.15,
  turnRate: 5.0 / 3.0,
  physics: newPhysics(),
};
