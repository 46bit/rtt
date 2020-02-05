import { Vector } from './vector';
import { Game } from './game';
import { Player, IColor } from './player';
import { PlayerUnits } from './player_units';
import { PowerSource } from './entities/power_source';
import { Commander } from './entities/commander';

export interface IGameConfig {
  map: IMap;
  unitCap: number;
  players: IPlayerConfig[];
}

export interface IPlayerConfig {
  name: string;
  color: IColor;
  commanderPosition: Vector;
}

export interface IMap {
  name: string;
  worldSize: number;
  powerSources: Vector[];
}

export function gameFromConfig(gameConfig: IGameConfig): Game {
  let powerSources = gameConfig.map.powerSources.map((v) => new PowerSource(v));
  let players = gameConfig.players.map((p) => {
    const player = new Player(p.name, p.color, new PlayerUnits(gameConfig.unitCap));
    player.units.commander = new Commander(p.commanderPosition, Math.random() * 2 * Math.PI, player);
    return player;
  });
  return new Game(powerSources, players);
}
