import { Player, Vector } from '../';
import { IBot, IBotKind, BotMetadata } from '../entities';
import * as abilities from '../abilities';

export class BotController extends abilities.KillableController<IBot> {
  readonly kind = IBotKind;
  readonly entityMetadata = BotMetadata;

  newEntity(position: Vector, player: Player): IBot {
    const kind = "bot";
    return {
      kind,
      dead: false,
      health: this.entityMetadata.fullHealth,
    };
  }

  updateEntities(bots: IBot[], pathfinder: abilities.Pathfinder): IBot[] {
    return bots;
  }
}
