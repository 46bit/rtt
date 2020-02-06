import * as THREE from 'three';
import * as rtt_engine from './rtt_engine';
import * as rtt_threejs_renderer from './rtt_threejs_renderer';

window.THREE = THREE;

function main() {
  const map = {
    name: 'double-cross',
    worldSize: 600,
    powerSources: [
      new rtt_engine.Vector(155, 65),
      new rtt_engine.Vector(65, 155),
      new rtt_engine.Vector(445, 65),
      new rtt_engine.Vector(535, 155),
      new rtt_engine.Vector(65, 445),
      new rtt_engine.Vector(155, 535),
      new rtt_engine.Vector(445, 535),
      new rtt_engine.Vector(535, 445),
      new rtt_engine.Vector(75, 300),
      new rtt_engine.Vector(165, 300),
      new rtt_engine.Vector(255, 300),
      new rtt_engine.Vector(345, 300),
      new rtt_engine.Vector(435, 300),
      new rtt_engine.Vector(525, 300),
      new rtt_engine.Vector(300, 75),
      new rtt_engine.Vector(300, 165),
      new rtt_engine.Vector(300, 255),
      new rtt_engine.Vector(300, 345),
      new rtt_engine.Vector(300, 435),
      new rtt_engine.Vector(300, 525),
    ],
  };
  const config = {
    map,
    unitCap: 500,
    players: [{
      name: 'green',
      color: new THREE.Color("rgb(0, 255, 0)"),
      commanderPosition: new rtt_engine.Vector(535, 65),
    }, {
      name: 'red',
      color: new THREE.Color("rgb(255, 0, 0)"),
      commanderPosition: new rtt_engine.Vector(535, 535),
    }, {
      name: 'purple',
      color: new THREE.Color('magenta'),
      commanderPosition: new rtt_engine.Vector(65, 65),
    }, {
      name: 'blue',
      color: new THREE.Color('deepskyblue'),
      commanderPosition: new rtt_engine.Vector(65, 535),
    }]
  };

  let renderer = new rtt_threejs_renderer.Renderer(map.worldSize, window, document);
  renderer.animate(true);

  // const grid = new THREE.GridHelper(map.worldSize, map.worldSize / 25);
  // grid.position.z = -0.1;
  // grid.rotation.x = Math.PI / 2;
  // renderer.scene.add(grid);

  let game = rtt_engine.gameFromConfig(config);
  window.game = game;
  window.rtt_engine = rtt_engine;
  window.rtt_threejs_renderer = rtt_threejs_renderer;

  let commanderPresenters: rtt_threejs_renderer.CommanderPresenter[] = [];
  let powerSourcePresenter = new rtt_threejs_renderer.PowerSourcePresenter(game, renderer.gameCoordsGroup);
  powerSourcePresenter.predraw();
  let botPresenters: rtt_threejs_renderer.BotPresenter[] = [];
  let factoryPresenters: rtt_threejs_renderer.FactoryPresenter[] = [];
  let healthinessPresenters: rtt_threejs_renderer.HealthinessPresenter[] = [];
  let powerGeneratorPresenters: rtt_threejs_renderer.PowerGeneratorPresenter[] = [];
  for (let i in game.players) {
    const player = game.players[i];
    if (player.units.commander != null) {
      const commanderPresenter = new rtt_threejs_renderer.CommanderPresenter(player.units.commander, renderer.gameCoordsGroup);
      commanderPresenter.predraw();
      commanderPresenters.push(commanderPresenter);

      player.units.commander.orders[0] = {
        kind: 'construct',
        structureClass: rtt_engine.Factory,
        position: new rtt_engine.Vector(
          player.units.commander.position.x + 30,
          player.units.commander.position.y,
        ),
      };
    }
    const botPresenter = new rtt_threejs_renderer.BotPresenter(player, renderer.gameCoordsGroup);
    botPresenter.predraw();
    botPresenters.push(botPresenter);
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
    let collisions = quadtreePresenter!.quadtree.getCollisionsFor({
      collisionRadius: 1,
      position: rttPosition,
      player: null,
    });
    console.log(collisions);
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
        console.log("order");
        if (selected instanceof rtt_engine.Commander && (buildChoice == "factory" || buildChoice == "power-generator")) {
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

  let quadtreePresenter: rtt_threejs_renderer.QuadtreePresenter | null = null;
  setInterval(() => {
    const start = new Date();

    let livingPlayers = game.players.filter((p) => !p.isDefeated());
    for (let i in livingPlayers) {
      const player = livingPlayers[i];

      for (let factory of player.units.factories) {
        factory.orders[0] = {
          kind: 'construct',
          unitClass: rtt_engine.Bot,
        };
      }

      const opposingPlayer = livingPlayers[(parseInt(i) + 1) % livingPlayers.length];
      const opposingUnits = opposingPlayer.units.allKillableCollidableUnits();
      const opposingUnitCount = opposingUnits.length;
      if (opposingUnitCount == 0) {
        continue;
      }
      for (let j in player.units.vehicles) {
        if (player.units.vehicles[j].orders.length > 0) {
          continue;
        }
        const target = opposingUnits[j % opposingUnitCount];
        player.units.vehicles[j].orders[0] = { kind: 'attack', target: target };
      }
    }

    const units = livingPlayers.map((p) => p.units.allKillableCollidableUnits()).flat();
    const quadtree = rtt_engine.IQuadrant.fromEntityCollisions(units);
    if (quadtreePresenter == null) {
      quadtreePresenter = new rtt_threejs_renderer.QuadtreePresenter(quadtree, renderer.gameCoordsGroup);
    } else if (Math.random() > 0.9) {
      quadtreePresenter.quadtree = quadtree;
    }
    //quadtreePresenter.draw();
    //console.log(quadtree.entities.length);
    let unitOriginalHealths: {[id: string]: number} = {};
    for (let unit of units) {
      if (unit.damage != null) {
        unitOriginalHealths[unit.id] = unit.health;
      }
    }

    let collisions = quadtree.getCollisions(units);
    for (let unitId in collisions) {
      const unit: rtt_engine.IKillable = units.filter((u: rtt_engine.IKillable) => u.id == unitId)[0];
      const numberOfCollidingUnits = collisions[unitId].length;
      // FIXME: We need to only apply damage if it fulfils IKillable…
      const damagePerCollidingUnit = unitOriginalHealths[unitId] / numberOfCollidingUnits;
      for (let collidingUnit of collisions[unitId]) {
        if (collidingUnit.damage != null) {
          collidingUnit.damage(damagePerCollidingUnit);
        }
      }
    }
    game.update();
    //console.log("game update time: " + ((new Date()) - start));

    const start2 = new Date();
    game.draw();
    powerSourcePresenter.draw();
    for (let commanderPresenter of commanderPresenters) {
      commanderPresenter.draw();
    }
    for (let botPresenter of botPresenters) {
      botPresenter.draw();
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
    //console.log("game draw time: " + ((new Date()) - start2));
  }, 1000 / 30);
}

main();
