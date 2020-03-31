import * as THREE from 'three';
import * as rtt_engine from './rtt_engine';
import * as rtt_threejs_renderer from './rtt_threejs_renderer';
import { IAI, ExistingAI, AttackNearestAI } from './ai';

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
      new rtt_engine.Obstruction(0, edge + spacing * 0.5, edge + spacing * 2, edge + spacing * 2.5),
      new rtt_engine.Obstruction(edge + spacing * 2, edge + spacing * 2.5, 0, edge + spacing * 0.5),

      new rtt_engine.Obstruction(size - edge - spacing * 0.5, size, edge + spacing * 2, edge + spacing * 2.5),
      new rtt_engine.Obstruction(size - edge - spacing * 2.5, size - edge - spacing * 2, 0, edge + spacing * 0.5),

      new rtt_engine.Obstruction(size - edge - spacing * 0.5, size, size - edge - spacing * 2.5, size - edge - spacing * 2),
      new rtt_engine.Obstruction(size - edge - spacing * 2.5, size - edge - spacing * 2, size - edge - spacing * 0.5, size),

      new rtt_engine.Obstruction(0, edge + spacing * 0.5, size - edge - spacing * 2.5, size - edge - spacing * 2),
      new rtt_engine.Obstruction(edge + spacing * 2, edge + spacing * 2.5, size - edge - spacing * 0.5, size),
    ],
    powerSources: [
      new rtt_engine.Vector(edge, edge),
      new rtt_engine.Vector(edge + spacing, edge),
      new rtt_engine.Vector(edge + spacing, edge + spacing),
      new rtt_engine.Vector(edge, edge + spacing),

      new rtt_engine.Vector(size - edge, edge),
      new rtt_engine.Vector(size - edge - spacing, edge),
      new rtt_engine.Vector(size - edge - spacing, edge + spacing),
      new rtt_engine.Vector(size - edge, edge + spacing),

      new rtt_engine.Vector(size - edge, size - edge - spacing),
      new rtt_engine.Vector(size - edge - spacing, size - edge - spacing),
      new rtt_engine.Vector(size - edge - spacing, size - edge),
      new rtt_engine.Vector(size - edge, size - edge),

      new rtt_engine.Vector(edge + spacing, size - edge),
      new rtt_engine.Vector(edge, size - edge),
      new rtt_engine.Vector(edge, size - edge - spacing),
      new rtt_engine.Vector(edge + spacing, size - edge - spacing),

      new rtt_engine.Vector(crossSpacing, size / 2),
      new rtt_engine.Vector(crossSpacing * 2, size / 2),
      new rtt_engine.Vector(crossSpacing * 3, size / 2),
      new rtt_engine.Vector(crossSpacing * 4, size / 2),
      new rtt_engine.Vector(crossSpacing * 5, size / 2),
      new rtt_engine.Vector(crossSpacing * 6, size / 2),
      new rtt_engine.Vector(size / 2, crossSpacing),
      new rtt_engine.Vector(size / 2, crossSpacing * 2),
      new rtt_engine.Vector(size / 2, crossSpacing * 3),
      new rtt_engine.Vector(size / 2, crossSpacing * 4),
      new rtt_engine.Vector(size / 2, crossSpacing * 5),
      new rtt_engine.Vector(size / 2, crossSpacing * 6),
    ],
  };
  const config = {
    map,
    unitCap: 500,
    players: [{
      name: 'green',
      color: new THREE.Color("rgb(0, 255, 0)"),
      commanderPosition: new rtt_engine.Vector(size - edge - spacing/2, edge + spacing/2),
    }, {
      name: 'red',
      color: new THREE.Color("rgb(255, 0, 0)"),
      commanderPosition: new rtt_engine.Vector(size - edge - spacing/2, size - edge - spacing/2),
    }, {
      name: 'purple',
      color: new THREE.Color('magenta'),
      commanderPosition: new rtt_engine.Vector(edge + spacing/2, edge + spacing/2),
    }, {
      name: 'blue',
      color: new THREE.Color('deepskyblue'),
      commanderPosition: new rtt_engine.Vector(edge + spacing/2, size - edge - spacing/2),
    }]
  };

  const bounds = new rtt_engine.Bounds(0, map.worldSize, 0, map.worldSize);

  let game = rtt_engine.gameFromConfig(config);
  const obstructionQuadtree = rtt_engine.IQuadrant.fromEntityCollisions(bounds, game.obstructions);
  window.game = game;
  window.rtt_engine = rtt_engine;
  window.rtt_threejs_renderer = rtt_threejs_renderer;

  // FIXME: Remove after debugging
  //return;

  let renderer = new rtt_threejs_renderer.Renderer(map.worldSize, window, document);
  renderer.animate(true);
  window.renderer = renderer;

  let triangulatedMap = rtt_engine.triangulate(map.worldSize, map.obstructions);
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
  let powerSourcePresenter = new rtt_threejs_renderer.PowerSourcePresenter(game, renderer.gameCoordsGroup);
  powerSourcePresenter.predraw();
  let obstructionPresenter = new rtt_threejs_renderer.ObstructionPresenter(game, renderer.gameCoordsGroup);
  obstructionPresenter.predraw();
  let commanderPresenters: rtt_threejs_renderer.CommanderPresenter[] = [];
  let botPresenters: rtt_threejs_renderer.BotPresenter[] = [];
  let shotgunTankPresenters: rtt_threejs_renderer.ShotgunTankPresenter[] = [];
  let shotgunProjectilePresenters: rtt_threejs_renderer.ShotgunProjectilePresenter[] = [];
  let artilleryTankPresenters: rtt_threejs_renderer.ArtilleryTankPresenter[] = [];
  let artilleryProjectilePresenters: rtt_threejs_renderer.ArtilleryProjectilePresenter[] = [];
  let titanPresenters: rtt_threejs_renderer.TitanPresenter[] = [];
  let titanProjectilePresenters: rtt_threejs_renderer.TitanProjectilePresenter[] = [];
  let factoryPresenters: rtt_threejs_renderer.FactoryPresenter[] = [];
  let healthinessPresenters: rtt_threejs_renderer.HealthinessPresenter[] = [];
  let powerGeneratorPresenters: rtt_threejs_renderer.PowerGeneratorPresenter[] = [];
  let turretPresenters: rtt_threejs_renderer.TurretPresenter[] = [];
  let turretProjectilePresenters: rtt_threejs_renderer.TurretProjectilePresenter[] = [];
  for (let i in game.players) {
    const player = game.players[i];
    if (player.units.commander != null) {
      const commanderPresenter = new rtt_threejs_renderer.CommanderPresenter(player.units.commander, renderer.gameCoordsGroup);
      commanderPresenter.predraw();
      commanderPresenters.push(commanderPresenter);
    }
    const botPresenter = new rtt_threejs_renderer.BotPresenter(player, renderer.gameCoordsGroup);
    botPresenter.predraw();
    botPresenters.push(botPresenter);
    const shotgunTankPresenter = new rtt_threejs_renderer.ShotgunTankPresenter(player, renderer.gameCoordsGroup);
    shotgunTankPresenter.predraw();
    shotgunTankPresenters.push(shotgunTankPresenter);
    const shotgunProjectilePresenter = new rtt_threejs_renderer.ShotgunProjectilePresenter(player, renderer.gameCoordsGroup);
    shotgunProjectilePresenter.predraw();
    shotgunProjectilePresenters.push(shotgunProjectilePresenter);
    const artilleryTankPresenter = new rtt_threejs_renderer.ArtilleryTankPresenter(player, renderer.gameCoordsGroup);
    artilleryTankPresenter.predraw();
    artilleryTankPresenters.push(artilleryTankPresenter);
    const artilleryProjectilePresenter = new rtt_threejs_renderer.ArtilleryProjectilePresenter(player, renderer.gameCoordsGroup);
    artilleryProjectilePresenter.predraw();
    artilleryProjectilePresenters.push(artilleryProjectilePresenter);
    const titanPresenter = new rtt_threejs_renderer.TitanPresenter(player, renderer.gameCoordsGroup);
    titanPresenter.predraw();
    titanPresenters.push(titanPresenter);
    const titanProjectilePresenter = new rtt_threejs_renderer.TitanProjectilePresenter(player, renderer.gameCoordsGroup);
    titanProjectilePresenter.predraw();
    titanProjectilePresenters.push(titanProjectilePresenter);
    const factoryPresenter = new rtt_threejs_renderer.FactoryPresenter(player, renderer.gameCoordsGroup);
    factoryPresenter.predraw();
    factoryPresenters.push(factoryPresenter);
    const healthinessPresenter = new rtt_threejs_renderer.HealthinessPresenter(player, renderer.gameCoordsGroup);
    healthinessPresenters.push(healthinessPresenter);
    const powerGeneratorPresenter = new rtt_threejs_renderer.PowerGeneratorPresenter(player, renderer.gameCoordsGroup);
    powerGeneratorPresenter.predraw();
    powerGeneratorPresenters.push(powerGeneratorPresenter);
    const turretPresenter = new rtt_threejs_renderer.TurretPresenter(player, renderer.gameCoordsGroup);
    turretPresenter.predraw();
    turretPresenters.push(turretPresenter);
    const turretProjectilePresenter = new rtt_threejs_renderer.TurretProjectilePresenter(player, renderer.gameCoordsGroup);
    turretProjectilePresenter.predraw();
    turretProjectilePresenters.push(turretProjectilePresenter);
  }

  let selected = undefined;
  let selectedBox = undefined;
  let buildChoice = undefined;
  let quadtree: any;
  document.addEventListener('mousedown', function (e) {
    let x = (e.clientX / window.innerWidth) * 2 - 1;
    let y = -(e.clientY / window.innerHeight) * 2 + 1;
    let mouse = new THREE.Vector2(x, y);

    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, renderer.camera);

    let plane = new THREE.Plane(new THREE.Vector3(0, 0, 1));
    //console.log(raycaster.intersectObject(plane));
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
    //console.log(collisions);
    // Based upon https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
    if (e.button == 0) {
      if (collisions.length == 1) {
        selected = collisions[0];
        if (selected instanceof rtt_engine.Commander) {
          document.getElementById("build-controls").style.display = "block";
        } else {
          document.getElementById("build-controls").style.display = "none";
          buildChoice = undefined;
        }
      } else {
        selected = undefined;
        document.getElementById("build-controls").style.display = "none";
        buildChoice = undefined;
      }
    } else if (e.button == 2) {
      // FIXME: There needs to be a better way than this to detect movable stuff
      if (selected != null && selected.movementRate != null) {
        //console.log("order");
        if (selected instanceof rtt_engine.Commander && (buildChoice == "factory" || buildChoice == "power-generator" || buildChoice == "turret")) {
          if (buildChoice == "factory") {
            selected.orders[0] = {
              kind: 'construct',
              structureClass: rtt_engine.Factory,
              position: rttPosition,
            }
          } else if (buildChoice == "power-generator") {
            const nearestPowerSource = _.minBy(game.powerSources.filter((p) => p.structure == null), (p) => (rtt_engine.Vector.subtract(rttPosition, p.position).magnitude()));
            if (rtt_engine.Vector.subtract(rttPosition, nearestPowerSource.position).magnitude() < nearestPowerSource.collisionRadius + 2) {
              selected.orders[0] = {
                kind: 'construct',
                structureClass: rtt_engine.PowerGenerator,
                position: nearestPowerSource.position,
                extra: [nearestPowerSource],
              }
            }
          } else if (buildChoice == "turret") {
            selected.orders[0] = {
              kind: 'construct',
              structureClass: rtt_engine.Turret,
              position: rttPosition,
            }
          }
          // Reset the build choice. Temporary hack until the user interface is better designed.
          buildChoice = undefined;
        } else if (collisions.length == 1 && collisions[0].player != selected.player) {
          selected.orders[0] = {
            kind: 'attack',
            target: collisions[0],
          }
        } else {
          selected.orders[0] = {
            kind: 'manoeuvre',
            destination: rttPosition,
          }
        }
      }
    }
  }, false);
  document.getElementById("build-factory").addEventListener('mousedown', function (e) {
    e.stopPropagation();
    buildChoice = "factory";
  }, false);
  document.getElementById("build-power-generator").addEventListener('mousedown', function (e) {
    e.stopPropagation();
    buildChoice = "power-generator";
  }, false);
  document.getElementById("build-turret").addEventListener('mousedown', function (e) {
    e.stopPropagation();
    buildChoice = "turret";
  }, false);

  let ais: IAI[] = game.players.map((player) => {
    const aiClass = Math.random() >= 0.5 ? AttackNearestAI : ExistingAI;
    console.log("player " + player.name + " using AI " + aiClass.name);
    return new aiClass(game, player, game.players.filter((p) => p != player));
  });

  let path: any;
  let pathStart: any;
  let pathEnd: any;
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
          //console.log("bounds " + JSON.stringify(bounds) + " killed " + unitOrProjectile.position.x + " " + unitOrProjectile.position.y);
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

      // if (game.updateCounter % 100 == 0) {
      //   if (path != undefined) {
      //     renderer.gameCoordsGroup.remove(path);
      //     path.material.dispose();
      //     path.geometry.dispose();
      //     path = undefined;
      //   }
      //   if (pathStart != undefined) {
      //     renderer.gameCoordsGroup.remove(pathStart);
      //     pathStart.material.dispose();
      //     pathStart.geometry.dispose();
      //     pathStart = undefined;
      //   }
      //   if (pathEnd != undefined) {
      //     renderer.gameCoordsGroup.remove(pathEnd);
      //     pathEnd.material.dispose();
      //     pathEnd.geometry.dispose();
      //     pathEnd = undefined;
      //   }
      //   let material = new THREE.LineBasicMaterial({ color: 0xffffff });
      //   let from = new rtt_engine.Vector(
      //     Math.random() * map.worldSize,
      //     Math.random() * map.worldSize
      //   );
      //   let to = new rtt_engine.Vector(
      //     Math.random() * map.worldSize,
      //     Math.random() * map.worldSize
      //   );

      //   // from.x = 321.94381764911583;
      //   // from.y = 311.00705914346884;
      //   // to.x = 145.50164006384801;
      //   // to.y = 335.0348767805669;
      //   if (to.y < from.y || to.x < from.x) {
      //     const temp = to;
      //     to = from;
      //     from = temp;
      //   }

      //   pathStart = new THREE.Mesh(new THREE.CircleBufferGeometry(5), new THREE.MeshBasicMaterial({color: 0x00ff00}));
      //   pathStart.position.x = from.x;
      //   pathStart.position.y = from.y;
      //   //renderer.gameCoordsGroup.add(pathStart);
      //   pathEnd = new THREE.Mesh(new THREE.CircleBufferGeometry(5), new THREE.MeshBasicMaterial({color: 0xff0000}));
      //   pathEnd.position.x = to.x;
      //   pathEnd.position.y = to.y;
      //   //renderer.gameCoordsGroup.add(pathEnd);

      //   let route = navmesh.findPath([from.x, from.y], [to.x, to.y]);
      //   // let route = rtt_engine.findPathWithAStar({
      //   //   collisionRadius: 10,
      //   //   position: from,
      //   // }, to, triangulatedMap);
      //   if (route == undefined) {
      //     console.log(`route not found from ${from.stringify()} to ${to.stringify()}`);
      //   } else {
      //     console.log(`route found from ${from.stringify()} to ${to.stringify()}: ${route.map((p) => [p.x, p.y])}`);
      //     let points = route.map((p) => new THREE.Vector3(p.x, p.y, 0));
      //     let geometry = new THREE.BufferGeometry().setFromPoints(points);
      //     path = new THREE.LineSegments(geometry, material);
      //     //renderer.gameCoordsGroup.add(path);
      //   }
      // }
    });

    rtt_threejs_renderer.time("update rendering", () => {
      game.draw();
      mapPresenter.draw();
      obstructionPresenter.draw();
      powerSourcePresenter.draw();
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
      if (selected != null) {
        if (selectedBox == null) {
          const geo = new THREE.RingBufferGeometry(selected.collisionRadius * 1.5, selected.collisionRadius * 1.5 + 4);
          let material = new THREE.MeshBasicMaterial({ color: selected.player.color, opacity: 0.5 });
          material.blending = THREE.AdditiveBlending;
          selectedBox = new THREE.Mesh(geo, material);
          renderer.gameCoordsGroup.add(selectedBox);
        }
        selectedBox.position.x = selected.position.x;
        selectedBox.position.y = selected.position.y;
      } else if (selectedBox != null) {
        renderer.gameCoordsGroup.remove(selectedBox);
        selectedBox = undefined;
      }
    });
    //console.log("game draw time: " + ((new Date()) - start2));
  }, 1000 / 30);
}

main();
