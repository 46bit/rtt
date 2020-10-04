import { Vector } from './vector';
import { Game } from './game';
import { Player } from './player';
import { PlayerUnits } from './player_units';
import { PowerSource, Obstruction } from './entities';
import { Commander } from './entities/commander';
import { Bounds } from './quadtree';

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
  obstructions: Obstruction[];
}

export function gameFromConfig(gameConfig: IGameConfig, bounds: Bounds, sandbox = false): Game {
  let powerSources = gameConfig.map.powerSources.map((v) => new PowerSource(v));
  let players = gameConfig.players.map((p) => {
    const player = new Player(p.name, p.color, new PlayerUnits(gameConfig.unitCap));
    player.storedEnergy = 1200;
    player.units.commander = new Commander(p.commanderPosition, Math.random() * 2 * Math.PI, player);
    return player;
  });
  return new Game(bounds, powerSources, players, gameConfig.map.obstructions, sandbox);
}
