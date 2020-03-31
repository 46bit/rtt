import * as THREE from 'three';
import * as rtt_engine from './rtt_engine';
import * as rtt_threejs_renderer from './rtt_threejs_renderer';
import { IAI, ExistingAI } from './ai';

window.THREE = THREE;

function main() {
  const size = 1000;
  const edge = 70;
  const spacing = 70;
  const crossSpacing = size / 7;
  const map = {
    name: 'double-cross',
    worldSize: size,
    obstructions: [
      new rtt_engine.Obstruction(size / 11, size,           10 * size / 11, 11 * size / 11),
      new rtt_engine.Obstruction(0,         10 * size / 11,  8 * size / 11,  9 * size / 11),
      new rtt_engine.Obstruction(size / 11, size,            6 * size / 11,  7 * size / 11),
      new rtt_engine.Obstruction(0,         10 * size / 11,  4 * size / 11,  5 * size / 11),
      new rtt_engine.Obstruction(size / 11, size,            2 * size / 11,  3 * size / 11),
      new rtt_engine.Obstruction(0,         10 * size / 11,  0,              1 * size / 11),
    ],
  };
  const config = {
    map,
    unitCap: 500,
    players: [{
      name: 'green',
      color: new THREE.Color("rgb(0, 255, 0)"),
      commanderPosition: new rtt_engine.Vector(size - edge - spacing/2, edge + spacing/2 + 10),
    }, {
      name: 'blue',
      color: new THREE.Color('deepskyblue'),
      commanderPosition: new rtt_engine.Vector(edge + spacing/2, size - edge - spacing/2 - 10),
    }]
  };

  const bounds = new rtt_engine.Bounds(0, map.worldSize, 0, map.worldSize);

  let game = rtt_engine.gameFromConfig(config);
  const obstructionQuadtree = rtt_engine.IQuadrant.fromEntityCollisions(bounds, game.obstructions);
  window.game = game;
  window.rtt_engine = rtt_engine;
  window.rtt_threejs_renderer = rtt_threejs_renderer;

  let renderer = new rtt_threejs_renderer.Renderer(map.worldSize, window, document);
  renderer.animate(true);
  window.renderer = renderer;

  let triangulatedMap = rtt_engine.triangulate(map.worldSize, map.obstructions, 16);

  // Manual step for the coronavirus tower defence: add entry and exit triangles that go off the
  // edge of the world
  let startIndex = triangulatedMap.points.length;
  triangulatedMap.points.push([16, map.worldSize + 50]);
  triangulatedMap.points.push([map.worldSize / 11 - 16, map.worldSize + 50]);
  triangulatedMap.points.push([map.worldSize / 11 - 16, map.worldSize - 16]);
  triangulatedMap.points.push([16, map.worldSize - 16]);
  triangulatedMap.passableTriangles.push([startIndex, startIndex + 1, startIndex + 2]);
  triangulatedMap.passableTriangles.push([startIndex + 2, startIndex + 3, startIndex]);
  startIndex = triangulatedMap.points.length;
  triangulatedMap.points.push([10 * map.worldSize / 11 + 16, -50]);
  triangulatedMap.points.push([map.worldSize - 16, -50]);
  triangulatedMap.points.push([map.worldSize - 16, 16]);
  triangulatedMap.points.push([10 * map.worldSize / 11 + 16, 16]);
  triangulatedMap.passableTriangles.push([startIndex, startIndex + 1, startIndex + 2]);
  triangulatedMap.passableTriangles.push([startIndex + 2, startIndex + 3, startIndex]);

  let triangulatedMapPresenter = new rtt_threejs_renderer.TriangulatedMapPresenter(triangulatedMap, renderer.gameCoordsGroup);
  //triangulatedMapPresenter.predraw();
  let navmesh = rtt_engine.triangulatedMapToNavMesh(triangulatedMap);
  window.navmesh = navmesh;
  window.routeBetween = function(from, to) {
    let navmeshRoute = navmesh.findPath([from.x, from.y], [to.x, to.y]);
    if (!navmeshRoute || navmeshRoute.length == 0) {
      return null;
    }
    return navmeshRoute.map((p) => new rtt_engine.Vector(p.x, p.y));
  };

  let mapPresenter = new rtt_threejs_renderer.MapPresenter(map, renderer.gameCoordsGroup);
  mapPresenter.predraw();
  let obstructionPresenter = new rtt_threejs_renderer.ObstructionPresenter(game, renderer.gameCoordsGroup);
  obstructionPresenter.predraw();
  let botPresenters: rtt_threejs_renderer.BotPresenter[] = [];
  let healthinessPresenters: rtt_threejs_renderer.HealthinessPresenter[] = [];
  let turretPresenters: rtt_threejs_renderer.TurretPresenter[] = [];
  let turretProjectilePresenters: rtt_threejs_renderer.TurretProjectilePresenter[] = [];
  for (let i in game.players) {
    const player = game.players[i];
    const botPresenter = new rtt_threejs_renderer.BotPresenter(player, renderer.gameCoordsGroup);
    botPresenter.predraw();
    botPresenters.push(botPresenter);

    const healthinessPresenter = new rtt_threejs_renderer.HealthinessPresenter(player, renderer.gameCoordsGroup);
    healthinessPresenters.push(healthinessPresenter);

    const turretPresenter = new rtt_threejs_renderer.TurretPresenter(player, renderer.gameCoordsGroup);
    turretPresenter.predraw();
    turretPresenters.push(turretPresenter);
    const turretProjectilePresenter = new rtt_threejs_renderer.TurretProjectilePresenter(player, renderer.gameCoordsGroup);
    turretProjectilePresenter.predraw();
    turretProjectilePresenters.push(turretProjectilePresenter);
  }

  let selected = undefined;
  let selectedBox = undefined;
  let quadtree: any;
  document.addEventListener('mousedown', function (e) {
    let x = (e.clientX / window.innerWidth) * 2 - 1;
    let y = -(e.clientY / window.innerHeight) * 2 + 1;
    let mouse = new THREE.Vector2(x, y);

    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, renderer.camera);

    let plane = new THREE.Plane(new THREE.Vector3(0, 0, 1));
    let result = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, result);
    let rtsPosition = result.add(new THREE.Vector3(
      map.worldSize / 2,
      map.worldSize / 2,
      0,
    ));
    let rttPosition = new rtt_engine.Vector(rtsPosition.x, rtsPosition.y);
    let collisions = quadtree.getCollisionsFor({
      collisionRadius: 1,
      position: rttPosition,
      player: null,
    });
  }, false);

  let ais: IAI[] = game.players.map((player) => {
    return new ExistingAI(game, player, game.players.filter((p) => p != player));
  });

  setInterval(() => {
    rtt_threejs_renderer.time("update", () => {
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
          unitOrProjectile.kill();
        }
      }

      quadtree = rtt_engine.IQuadrant.fromEntityCollisions(bounds, unitsAndProjectiles);
      let unitOriginalHealths: {[id: string]: number} = {};
      for (let unit of unitsAndProjectiles) {
        if (unit.damage != null) {
          unitOriginalHealths[unit.id] = unit.health;
        }
      }

      let collisions = quadtree.getCollisions(unitsAndProjectiles);
      for (let unitId in collisions) {
        const unit: rtt_engine.IKillable = unitsAndProjectiles.filter((u: rtt_engine.IKillable) => u.id == unitId)[0];
        let unitCollisions = collisions[unitId];
        if (unit instanceof rtt_engine.Projectile) {
          unitCollisions = unitCollisions.filter((u) => !(u instanceof rtt_engine.Projectile));
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

      game.update();

      const units = livingPlayers.map((p) => p.units.allKillableCollidableUnits()).flat();
      const obstructionCollisions = obstructionQuadtree.getCollisions(units);
      for (let unitId in obstructionCollisions) {
        const unitOrProjectile = units.filter((u: rtt_engine.IKillable) => u.id == unitId)[0];
        if (unitOrProjectile.dead) {
          continue;
        }
        for (let obstruction of obstructionCollisions[unitId]) {
          obstruction.collide(unitOrProjectile);
        }
      }
    });

    rtt_threejs_renderer.time("update rendering", () => {
      game.draw();
      mapPresenter.draw();
      obstructionPresenter.draw();
      for (let botPresenter of botPresenters) {
        botPresenter.draw();
      }
      for (let healthinessPresenter of healthinessPresenters) {
        healthinessPresenter.draw();
      }
      for (let turretPresenter of turretPresenters) {
        turretPresenter.draw();
      }
      for (let turretProjectilePresenter of turretProjectilePresenters) {
        turretProjectilePresenter.draw();
      }
      // if (selected != null) {
      //   if (selectedBox == null) {
      //     const geo = new THREE.RingBufferGeometry(selected.collisionRadius * 1.5, selected.collisionRadius * 1.5 + 4);
      //     let material = new THREE.MeshBasicMaterial({ color: selected.player.color, opacity: 0.5 });
      //     material.blending = THREE.AdditiveBlending;
      //     selectedBox = new THREE.Mesh(geo, material);
      //     renderer.gameCoordsGroup.add(selectedBox);
      //   }
      //   selectedBox.position.x = selected.position.x;
      //   selectedBox.position.y = selected.position.y;
      // } else if (selectedBox != null) {
      //   renderer.gameCoordsGroup.remove(selectedBox);
      //   selectedBox = undefined;
      // }
    });
    //console.log("game draw time: " + ((new Date()) - start2));
  }, 1000 / 30);
}

main();
