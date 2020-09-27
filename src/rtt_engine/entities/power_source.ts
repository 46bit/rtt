import { IPowerGenerator } from '.';
import * as abilities from '../abilities';

export interface IPowerSource extends abilities.ICollidableEntity {
  kind: "powerSource";
  structure: IPowerGenerator | null;
}

export const PowerSourceMetadata = {
  collisionRadius: 7.0,
};
