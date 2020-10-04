import * as THREE from 'three';
import * as rtt_engine from './rtt_engine';
import * as rtt_renderer from './rtt_renderer';
import { IAI, ExistingAI, AttackNearestAI, ExpansionAI } from './ai';

declare global {
  interface Window {
    THREE: typeof THREE;
    rttEngine: typeof rtt_engine;
    rttRenderer: typeof rtt_renderer;
    paused: boolean;
    game: rtt_engine.Game;
    renderer: rtt_renderer.Renderer;
    selection: rtt_renderer.Selection;
    navmesh: any;
    obstacleBorderLessNavmesh: any;
  }
}

window.THREE = THREE;
window.rttEngine = rtt_engine;
window.rttRenderer = rtt_renderer;
window.paused = false;

function mirrorFor4Players(worldSize: number, powerSources: rtt_engine.Vector[], obstructions: rtt_engine.Obstruction[]): [rtt_engine.Vector[], rtt_engine.Obstruction[]] {
  let newPowerSources = [];
  for (const powerSource of powerSources) {
    newPowerSources.push(new rtt_engine.Vector(
      worldSize - powerSource.y,
      powerSource.x,
    ));
    newPowerSources.push(new rtt_engine.Vector(
      powerSource.y,
      worldSize - powerSource.x,
    ));
    newPowerSources.push(new rtt_engine.Vector(
      worldSize - powerSource.x,
      worldSize - powerSource.y,
    ));
  }
  powerSources = powerSources.concat(...newPowerSources);

  let newObstructions = [];
  for (const obstruction of obstructions) {
    newObstructions.push(new rtt_engine.Obstruction(
      worldSize - obstruction.right,
      worldSize - obstruction.left,
      worldSize - obstruction.bottom,
      worldSize - obstruction.top,
    ));
    newObstructions.push(new rtt_engine.Obstruction(
      worldSize - obstruction.bottom,
      worldSize - obstruction.top,
      obstruction.right,
      obstruction.left,
    ));
    newObstructions.push(new rtt_engine.Obstruction(
      obstruction.bottom,
      obstruction.top,
      worldSize - obstruction.right,
      worldSize - obstruction.left,
    ));
  }
  obstructions = obstructions.concat(...newObstructions);

  return [powerSources, obstructions];
}

function main() {
  const size = 1600;
  const edge = 70;
  const spacing = 70;
  const crossSpacing = size / 7;
  let [powerSources, obstructions] = mirrorFor4Players(size, [
    new rtt_engine.Vector(edge, edge),
    new rtt_engine.Vector(edge + spacing, edge),
    new rtt_engine.Vector(edge + spacing, edge + spacing),
    new rtt_engine.Vector(edge, edge + spacing),
    new rtt_engine.Vector(edge, edge + spacing * 3.5),
    new rtt_engine.Vector(edge + spacing * 2, edge + spacing * 3.5),
    new rtt_engine.Vector(edge + spacing * 4, edge + spacing * 3.5),
    new rtt_engine.Vector(edge, size / 2 - spacing * 1.5),
    new rtt_engine.Vector(edge, size / 2),
    new rtt_engine.Vector(edge + spacing * 3.5, edge + spacing * 7.5),
    new rtt_engine.Vector(edge + spacing * 3.5, edge + spacing * 9.5),
    new rtt_engine.Vector(edge + spacing * 3.5, edge + spacing * 11.5),
    new rtt_engine.Vector(edge + spacing * 6, edge + spacing * 5),
    new rtt_engine.Vector(edge + spacing * 7.5, edge + spacing * 5),
    new rtt_engine.Vector(edge + spacing * 5.2, edge + spacing * 1.5),
    new rtt_engine.Vector(edge + spacing * 7.8, edge + spacing * 7.8),
    new rtt_engine.Vector(edge + spacing * 7.8, edge + spacing * 9.3),
  ], [
    new rtt_engine.Obstruction(0, spacing * 3, size - edge - spacing * 4, size - edge - spacing * 3),

    new rtt_engine.Obstruction(edge + spacing, edge + spacing * 2, size / 2 - spacing * 4.5, size / 2 + spacing * 4),
    new rtt_engine.Obstruction(edge + spacing, edge + spacing * 3, size / 2 - spacing * 5.5, size / 2 - spacing * 4.5),

    new rtt_engine.Obstruction(edge + spacing * 5, edge + spacing * 7, size / 2 + spacing, size / 2 + spacing * 2),
    new rtt_engine.Obstruction(edge + spacing * 6, edge + spacing * 7, size / 2 - spacing * 4, size / 2 - spacing * 2),
    new rtt_engine.Obstruction(edge + spacing * 6, edge + spacing * 7, size / 2 + spacing * 2, size / 2 + spacing * 4),
  ]);
  const map = {
    name: 'double-cross',
    worldSize: size,
    obstructions: obstructions,
    powerSources: powerSources,
  };
  const config = {
    map,
    unitCap: 500,
    players: [{
      name: 'Green',
      color: new THREE.Color("rgb(0, 255, 0)"),
      commanderPosition: new rtt_engine.Vector(size - edge - spacing/2, edge + spacing/2),
    }, {
      name: 'Red',
      color: new THREE.Color("rgb(255, 0, 0)"),
      commanderPosition: new rtt_engine.Vector(size - edge - spacing/2, size - edge - spacing/2),
    }, {
      name: 'Purple',
      color: new THREE.Color('magenta'),
      commanderPosition: new rtt_engine.Vector(edge + spacing/2, edge + spacing/2),
    }, {
      name: 'Blue',
      color: new THREE.Color('deepskyblue'),
      commanderPosition: new rtt_engine.Vector(edge + spacing/2, size - edge - spacing/2),
    }]
  };
  const bounds = new rtt_engine.Bounds(0, map.worldSize, 0, map.worldSize);
  let game = rtt_engine.gameFromConfig(config, bounds);
  window.game = game;

  game.ais = game.players.map((player) => {
    const aiClass = Math.random() >= 0.66 ? AttackNearestAI : Math.random() > 0.5 ? ExistingAI : ExpansionAI;
    player.aiName = aiClass.name;
    return new aiClass(game, player, game.players.filter((p) => p != player));
  });

  // The final parameter here is how closely the triangles should go to unpassable obstacles.
  // Small values will make pathfinding collide a lot; large values will create slightly
  // suboptimal paths.
  let triangulatedMap = rtt_engine.triangulate(map.worldSize, map.obstructions, 18);
  let navmesh = rtt_engine.triangulatedMapToNavMesh(triangulatedMap);
  window.navmesh = navmesh;
  // To prevent units close to obstacles from suddenly not being able to path because they are
  // off the navmesh, this navmesh is a backup which goes all the way up to the boundaries rather
  // than having a border around obstacles. It's only used when pathfinding with the other navmesh
  // fails (e.g., when a unit collided with an obstacle, was pushed out, but is now closer to
  // the obstacle than the normal navmesh goes.)
  let obstacleBorderLessTriangulatedMap = rtt_engine.triangulate(map.worldSize, map.obstructions, 0);
  let obstacleBorderLessNavmesh = rtt_engine.triangulatedMapToNavMesh(obstacleBorderLessTriangulatedMap);
  window.obstacleBorderLessNavmesh = obstacleBorderLessNavmesh;
  let context: rtt_engine.IEntityUpdateContext = {
    pathfinder: function(from: rtt_engine.Vector, to: rtt_engine.Vector) {
      let navmeshRoute = navmesh.findPath(from, to);
      if (!navmeshRoute || navmeshRoute.length == 0) {
        navmeshRoute = obstacleBorderLessNavmesh.findPath(from, to);
      }
      if (!navmeshRoute || navmeshRoute.length == 0) {
        return null;
      }
      return navmeshRoute.map((p: {x: number, y: number}) => new rtt_engine.Vector(p.x, p.y));
    },
  };

  const rttDiv = document.getElementById("rtt")!;
  const rttViewport = rttDiv.getElementsByClassName("game--viewport")[0]! as HTMLElement;
  const rttSidebar = rttDiv.getElementsByClassName("game--sidebar")[0]! as HTMLElement;
  let gameRenderer = new rtt_renderer.GameRenderer(map, game, rttViewport, rttSidebar);

  setInterval(() => {
    if (window.paused) {
      return;
    }

    rtt_renderer.time("update", () => {
      game.update(context);
    });

    rtt_renderer.time("update rendering", () => {
      gameRenderer.update();
    });
  }, 1000 / 30);
}

main();
