import { Vector } from './vector';
import { Game } from './game';
import { Player } from './player';
import { PlayerUnits } from './player_units';
import { Obstruction } from './entities';

export interface IGameConfig {
  map: IMap;
  unitCap: number;
  players: IPlayerConfig[];
}

export interface IPlayerConfig {
  name: string;
  color: any;
  commanderPosition: Vector;
}

export interface IMap {
  name: string;
  worldSize: number;
  obstructions: Obstruction[];
}

export function gameFromConfig(gameConfig: IGameConfig, sandbox = false): Game {
  let players = gameConfig.players.map((p) => {
    const player = new Player(p.name, p.color, new PlayerUnits(gameConfig.unitCap));
    return player;
  });
  return new Game(players, gameConfig.map.obstructions, sandbox);
}
