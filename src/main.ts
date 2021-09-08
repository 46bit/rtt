import lodash from 'lodash';
import * as THREE from 'three';
import Stats from 'stats-js';
import * as rtt_engine from './rtt_engine';
import * as rtt_renderer from './rtt_renderer';
import { IAI, ExistingAI, AttackNearestAI, ExpansionAI } from './ai';

class Profiler {
  game: rtt_engine.Game;
  latestFrame: number;
  timesByFrame: {[name: string]: number}[];

  constructor(game: rtt_engine.Game) {
    this.game = game;
    this.latestFrame = this.game.updateCounter;
    this.timesByFrame = [];
  }

  time<R>(name: string, callback: () => R): R {
    this.latestFrame = this.game.updateCounter;
    const clock = new THREE.Clock();
    clock.start();
    let returnValue = callback();
    const elapsed = clock.getElapsedTime();
    this.timesByFrame[this.latestFrame] = this.timesByFrame[this.latestFrame] || {};
    this.timesByFrame[this.latestFrame][name] = this.timesByFrame[this.latestFrame][name] || 0;
    this.timesByFrame[this.latestFrame][name] += elapsed;
    return returnValue;
  }

  print(sum_over_recent_frames = 1) {
    const aggregatedTimes: {[name: string]: number} = {};
    for (let i = 0; i < sum_over_recent_frames; i++) {
      const targetFrame = this.latestFrame - i;
      lodash.forEach(this.timesByFrame[targetFrame], (value: number, key: string) => {
        aggregatedTimes[key] = aggregatedTimes[key] || 0;
        aggregatedTimes[key] += value;
      })
    }

    const totalTime = aggregatedTimes["total"];
    const percentages = lodash.map(aggregatedTimes, (value: number, key: string) => {
      const percentage = value / totalTime * 100;
      if (key == "total" || percentage < 20) {
        return "";
      }
      return `${key}=${Math.round(percentage)}% `;
    });

    const frameTime = totalTime / sum_over_recent_frames;
    const maxPossibleFps = Math.ceil(1 / frameTime);
    const frameDescription = sum_over_recent_frames == 1 ? `#${this.latestFrame}` : `#${this.latestFrame} - ${sum_over_recent_frames}`;
    const message = `<${maxPossibleFps}fps ${lodash.join(percentages, "")} [${frameDescription}]`;
    if (maxPossibleFps < 40) {
      console.warn(message);
    } else {
      console.log(message);
    }
  }
}

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
    profiler: Profiler;
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
  window.profiler = new Profiler(game);

  game.ais = game.players.map((player) => {
    const aiClass = Math.random() >= 0.8 ? AttackNearestAI : Math.random() > 0.8 ? ExistingAI : ExpansionAI;
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
      return window.profiler.time("pathfinder", () => {
        let navmeshRoute = navmesh.findPath(from, to);
        if (!navmeshRoute || navmeshRoute.length == 0) {
          navmeshRoute = obstacleBorderLessNavmesh.findPath(from, to);
        }
        if (!navmeshRoute || navmeshRoute.length == 0) {
          return null;
        }
        return navmeshRoute.map((p: {x: number, y: number}) => new rtt_engine.Vector(p.x, p.y));
      });
    },
  };

  const rttDiv = document.getElementById("rtt")!;
  const rttViewport = rttDiv.getElementsByClassName("game--viewport")[0]! as HTMLElement;
  const sidebarElement = rttDiv.getElementsByClassName("game--sidebar");
  const rttSidebar = (sidebarElement.length == 0) ? null : rttDiv.getElementsByClassName("game--sidebar")[0]! as HTMLElement;
  let gameRenderer = new rtt_renderer.GameRenderer(map, game, rttViewport, rttSidebar);

  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);

  const animate = () => {
    stats.begin();
    window.profiler.time("total", () => {
      if (!window.paused) {
        window.profiler.time("update", () => {
          game.update(context);
        });
        window.profiler.time("render", () => {
          gameRenderer.update();
        });
      }
    });
    stats.end();
    //if (game.updateCounter % 40 == 39) {
    window.profiler.print(1);
    //}
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

main();
