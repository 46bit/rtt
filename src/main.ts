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
  const rttDiv = document.getElementById("rtt")!;
  const rttViewport = rttDiv.getElementsByClassName("game--viewport")[0]!;
  const rttSidebar = rttDiv.getElementsByClassName("game--sidebar")[0]!;

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

  let game = rtt_engine.gameFromConfig(config);
  const obstructionQuadtree = rtt_engine.IQuadrant.fromEntityCollisions(bounds, game.obstructions as rtt_engine.ICollidable[]);
  window.game = game;

  let ais: IAI[] = game.players.map((player) => {
    const aiClass = Math.random() >= 0.3 ? AttackNearestAI : Math.random() > 0.5 ? ExistingAI : ExpansionAI;
    player.aiName = aiClass.name;
    return new aiClass(game, player, game.players.filter((p) => p != player));
  });

  let renderer = new rtt_renderer.Renderer(map.worldSize, window, document, rttViewport);
  renderer.animate(true);
  window.renderer = renderer;

  let screenPositionToWorldPosition = new rtt_renderer.ScreenPositionToWorldPosition(renderer.renderer.domElement, renderer.camera);
  let selection = new rtt_renderer.Selection(game, screenPositionToWorldPosition);
  window.selection = selection;
  let selectionPresenter = new rtt_renderer.SelectionPresenter(selection, renderer.gameCoordsGroup);

  let ui = new rtt_renderer.UI(game, selection, rttSidebar, rttViewport);

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

  //let triangulatedMapPresenter = new rtt_renderer.TriangulatedMapPresenter(obstacleBorderLessTriangulatedMap, renderer.gameCoordsGroup);
  //triangulatedMapPresenter.predraw();

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

  let mapPresenter = new rtt_renderer.MapPresenter(map, renderer.gameCoordsGroup);
  mapPresenter.predraw();
  let powerSourcePresenter = new rtt_renderer.PowerSourcePresenter(game, renderer.gameCoordsGroup);
  powerSourcePresenter.predraw();
  let obstructionPresenter = new rtt_renderer.ObstructionPresenter(game, renderer.gameCoordsGroup);
  obstructionPresenter.predraw();
  let commanderPresenters: rtt_renderer.CommanderPresenter[] = [];
  let botPresenters: rtt_renderer.BotPresenter[] = [];
  let shotgunTankPresenters: rtt_renderer.ShotgunTankPresenter[] = [];
  let shotgunProjectilePresenters: rtt_renderer.ShotgunProjectilePresenter[] = [];
  let artilleryTankPresenters: rtt_renderer.ArtilleryTankPresenter[] = [];
  let artilleryProjectilePresenters: rtt_renderer.ArtilleryProjectilePresenter[] = [];
  let titanPresenters: rtt_renderer.TitanPresenter[] = [];
  let titanProjectilePresenters: rtt_renderer.TitanProjectilePresenter[] = [];
  let engineerPresenters: rtt_renderer.EngineerPresenter[] = [];
  let factoryPresenters: rtt_renderer.FactoryPresenter[] = [];
  let healthinessPresenters: rtt_renderer.HealthinessPresenter[] = [];
  let powerGeneratorPresenters: rtt_renderer.PowerGeneratorPresenter[] = [];
  let turretPresenters: rtt_renderer.TurretPresenter[] = [];
  let turretProjectilePresenters: rtt_renderer.TurretProjectilePresenter[] = [];
  for (let i in game.players) {
    const player = game.players[i];
    if (player.units.commander != null) {
      const commanderPresenter = new rtt_renderer.CommanderPresenter(player.units.commander, renderer.gameCoordsGroup);
      commanderPresenter.predraw();
      commanderPresenters.push(commanderPresenter);
    }
    const botPresenter = new rtt_renderer.BotPresenter(player, renderer.gameCoordsGroup);
    botPresenters.push(botPresenter);
    const shotgunTankPresenter = new rtt_renderer.ShotgunTankPresenter(player, renderer.gameCoordsGroup);
    shotgunTankPresenters.push(shotgunTankPresenter);
    const shotgunProjectilePresenter = new rtt_renderer.ShotgunProjectilePresenter(player, renderer.gameCoordsGroup);
    shotgunProjectilePresenters.push(shotgunProjectilePresenter);
    const artilleryTankPresenter = new rtt_renderer.ArtilleryTankPresenter(player, renderer.gameCoordsGroup);
    artilleryTankPresenters.push(artilleryTankPresenter);
    const artilleryProjectilePresenter = new rtt_renderer.ArtilleryProjectilePresenter(player, renderer.gameCoordsGroup);
    artilleryProjectilePresenters.push(artilleryProjectilePresenter);
    const titanPresenter = new rtt_renderer.TitanPresenter(player, renderer.gameCoordsGroup);
    titanPresenter.predraw();
    titanPresenters.push(titanPresenter);
    const titanProjectilePresenter = new rtt_renderer.TitanProjectilePresenter(player, renderer.gameCoordsGroup);
    titanProjectilePresenter.predraw();
    titanProjectilePresenters.push(titanProjectilePresenter);
    const engineerPresenter = new rtt_renderer.EngineerPresenter(player, renderer.gameCoordsGroup);
    engineerPresenters.push(engineerPresenter);
    const factoryPresenter = new rtt_renderer.FactoryPresenter(player, renderer.gameCoordsGroup);
    factoryPresenters.push(factoryPresenter);
    const healthinessPresenter = new rtt_renderer.HealthinessPresenter(player, renderer.gameCoordsGroup);
    healthinessPresenters.push(healthinessPresenter);
    const powerGeneratorPresenter = new rtt_renderer.PowerGeneratorPresenter(player, renderer.gameCoordsGroup);
    powerGeneratorPresenter.predraw();
    powerGeneratorPresenters.push(powerGeneratorPresenter);
    const turretPresenter = new rtt_renderer.TurretPresenter(player, renderer.gameCoordsGroup);
    turretPresenter.predraw();
    turretPresenters.push(turretPresenter);
    const turretProjectilePresenter = new rtt_renderer.TurretProjectilePresenter(player, renderer.gameCoordsGroup);
    turretProjectilePresenter.predraw();
    turretProjectilePresenters.push(turretProjectilePresenter);
  }

  let buildChoice = undefined;
  let quadtree: any;
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });
  renderer.renderer.domElement.addEventListener('mousedown', function (e) {
    e.preventDefault();
    selection.mousedown(e);
  }, false);
  renderer.renderer.domElement.addEventListener('mousemove', function (e) {
    e.preventDefault();
    selection.mousemove(e);
  }, false);
  // Detect mouseup anywhere, so selections in progress don't miss the mouseup
  document.body.addEventListener('mouseup', function (e) {
    e.preventDefault();
    selection.mouseup(e, quadtree);
  }, false);

  setInterval(() => {
    if (window.paused) {
      return;
    }

    rtt_renderer.time("update", () => {
      selection.update();

      for (let ai of ais) {
        if (ai.player.isDefeated()) {
          continue;
        }
        ai.update();
      }

      let livingPlayers = game.players.filter((p) => !p.isDefeated());
      let unitsAndProjectiles = livingPlayers.map((p) => p.units.allKillableCollidableUnits()).flat();
      unitsAndProjectiles.push(...game.players.map((p) => p.turretProjectiles).flat());

      for (let unitOrProjectile of unitsAndProjectiles) {
        if (!bounds.contains(unitOrProjectile, () => 0)) {
          //console.log("bounds " + JSON.stringify(bounds) + " killed " + unitOrProjectile.position.x + " " + unitOrProjectile.position.y);
          unitOrProjectile.kill();
        }
      }

      quadtree = rtt_engine.IQuadrant.fromEntityCollisions(bounds, unitsAndProjectiles);
      let unitOriginalHealths: {[id: string]: number} = {};
      for (let unit of unitsAndProjectiles) {
        if (unit.damage != null) {
          unitOriginalHealths[unit.id] = (unit instanceof rtt_engine.Engineer) ? unit.health / 6 : unit.health;
        }
      }

      let collisions = quadtree.getCollisions(unitsAndProjectiles);
      for (let unitId in collisions) {
        const unit: rtt_engine.IKillable = unitsAndProjectiles.filter((u: rtt_engine.IKillable) => u.id == unitId)[0];
        let unitCollisions = collisions[unitId];
        if (unit instanceof rtt_engine.Projectile) {
          unitCollisions = unitCollisions.filter((u: rtt_engine.IKillable) => !(u instanceof rtt_engine.Projectile));
        }
        const numberOfCollidingUnits = unitCollisions.length;
        if (numberOfCollidingUnits == 0) {
          continue;
        }
        // FIXME: We need to only apply damage if it fulfils IKillable…
        const damagePerCollidingUnit = unitOriginalHealths[unitId] / numberOfCollidingUnits;
        for (let collidingUnit of unitCollisions) {
          if (collidingUnit.damage != null) {
            collidingUnit.damage(damagePerCollidingUnit);
          }
        }
      }

      game.update(context);

      const units = livingPlayers.map((p) => p.units.allKillableCollidableUnits()).flat();
      const obstructionCollisions = obstructionQuadtree.getCollisions(units);
      for (let unitId in obstructionCollisions) {
        const unitOrProjectile = units.filter((u: rtt_engine.IKillable) => u.id == unitId)[0];
        if (unitOrProjectile.dead) {
          continue;
        }
        for (let obstruction of obstructionCollisions[unitId]) {
          (obstruction as rtt_engine.Obstruction).collide(unitOrProjectile);
        }
      }
    });

    rtt_renderer.time("update rendering", () => {
      mapPresenter.draw();
      obstructionPresenter.draw();
      powerSourcePresenter.draw();
      selectionPresenter.draw();
      for (let commanderPresenter of commanderPresenters) {
        commanderPresenter.draw();
      }
      for (let botPresenter of botPresenters) {
        botPresenter.draw();
      }
      for (let shotgunTankPresenter of shotgunTankPresenters) {
        shotgunTankPresenter.draw();
      }
      for (let shotgunProjectilePresenter of shotgunProjectilePresenters) {
        shotgunProjectilePresenter.draw();
      }
      for (let artilleryTankPresenter of artilleryTankPresenters) {
        artilleryTankPresenter.draw();
      }
      for (let artilleryProjectilePresenter of artilleryProjectilePresenters) {
        artilleryProjectilePresenter.draw();
      }
      for (let titanPresenter of titanPresenters) {
        titanPresenter.draw();
      }
      for (let titanProjectilePresenter of titanProjectilePresenters) {
        titanProjectilePresenter.draw();
      }
      for (let engineerPresenter of engineerPresenters) {
        engineerPresenter.draw();
      }
      for (let factoryPresenter of factoryPresenters) {
        factoryPresenter.draw();
      }
      for (let healthinessPresenter of healthinessPresenters) {
        healthinessPresenter.draw();
      }
      for (let powerGeneratorPresenter of powerGeneratorPresenters) {
        powerGeneratorPresenter.draw();
      }
      for (let turretPresenter of turretPresenters) {
        turretPresenter.draw();
      }
      for (let turretProjectilePresenter of turretProjectilePresenters) {
        turretProjectilePresenter.draw();
      }

      ui.update();
    });
  }, 1000 / 30);
}

main();
