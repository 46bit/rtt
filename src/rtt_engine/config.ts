import { Vector } from './vector';
import { Game } from './game';
import { Player } from './player';
import { PlayerUnits } from './player_units';
import { IPowerSource, IObstruction } from './entities';
import { ICommander } from './entities/commander';
import { Models } from '.';

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
  powerSources: Vector[];
  obstructions: IObstruction[];
}

export function gameFromConfig(gameConfig: IGameConfig, sandbox = false): Game {
  let powerSources = gameConfig.map.powerSources.map((v) => Models.powerSource.newEntity({position: v}));
  let players = gameConfig.players.map((p) => {
    const player = new Player(p.name, p.color, new PlayerUnits(gameConfig.unitCap));
    player.units.commander = Models.commander.newEntity({position: p.commanderPosition, player, built: true});
    return player;
  });
  return new Game(powerSources, players, gameConfig.map.obstructions, sandbox);
}
