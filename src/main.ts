import * as THREE from 'three';
import * as rtt_engine from './rtt_engine';
import * as rtt_threejs_renderer from './rtt_threejs_renderer';

window.THREE = THREE;

function main() {
  const map = {
    name: 'test-map',
    worldSize: 2600,
    powerGenerators: [
      new rtt_engine.Vector(100, 100),
      new rtt_engine.Vector(100, 700),
      new rtt_engine.Vector(700, 100),
      new rtt_engine.Vector(700, 700),
    ],
  };
  const config = {
    map,
    unitCap: 1500,
    players: [{
      name: 'red',
      color: { r: 255, g: 0, b: 0 },
      commanderPosition: new rtt_engine.Vector(150, 150),
    }, {
      name: 'green',
      color: { r: 0, g: 255, b: 0 },
      commanderPosition: new rtt_engine.Vector(650, 650),
    }]
  };

  let renderer = new rtt_threejs_renderer.Renderer(map.worldSize, window, document);
  renderer.animate(true);

  // const grid = new THREE.GridHelper(map.worldSize, map.worldSize / 25);
  // grid.position.z = -0.1;
  // grid.rotation.x = Math.PI / 2;
  // renderer.scene.add(grid);

  let game = rtt_engine.gameFromConfig(config, renderer.gameCoordsGroup);
  for (let player of game.players) {
    player.units.factories.push(new rtt_engine.Factory(
      new rtt_engine.Vector(
        map.worldSize * Math.random(),
        map.worldSize * Math.random(),
      ),
      player,
      true
     ));

    for (let i = 0; i < 4500; i++) {
      const bot = new rtt_engine.Bot(
        new rtt_engine.Vector(
          map.worldSize * Math.random(),
          map.worldSize * Math.random(),
        ),
        2 * Math.PI * Math.random(),
        player,
        true,
        renderer.gameCoordsGroup,
      );
      player.units.vehicles.push(bot);
    }
  }
  window.game = game;
  window.rtt_engine = rtt_engine;
  window.rtt_threejs_renderer = rtt_threejs_renderer;

  let botPresenters: rtt_threejs_renderer.BotPresenter[] = [];
  let factoryPresenters: rtt_threejs_renderer.FactoryPresenter[] = [];
  let healthinessPresenters: rtt_threejs_renderer.HealthinessPresenter[] = [];
  for (let i in game.players) {
    const player = game.players[i];
    if (player.units.commander != null) {
      player.units.commander.orders[0] = {
        kind: 'manoeuvre',
        destination: new rtt_engine.Vector(
          Math.random() * map.worldSize,
          Math.random() * map.worldSize,
        )
      };
    }
    for (let j in player.units.vehicles) {
      const k = (parseInt(i) + 1) % game.players.length;
      const target = game.players[k].units.vehicles[j];
      player.units.vehicles[j].orders[0] = { kind: 'attack', target: target };
    }
    const botPresenter = new rtt_threejs_renderer.BotPresenter(player, renderer.gameCoordsGroup);
    botPresenter.predraw();
    botPresenters.push(botPresenter);
    const factoryPresenter = new rtt_threejs_renderer.FactoryPresenter(player, renderer.gameCoordsGroup);
    factoryPresenter.predraw();
    factoryPresenters.push(factoryPresenter);
    const healthinessPresenter = new rtt_threejs_renderer.HealthinessPresenter(player, renderer.gameCoordsGroup);
    healthinessPresenters.push(healthinessPresenter);
  }
  let quadtreePresenter: rtt_threejs_renderer.QuadtreePresenter | null = null;
  setInterval(() => {
    const start = new Date();

    for (let i in game.players) {
      const player = game.players[i];

      player.units.factories[0].orders[0] = {
        kind: 'construct',
        unitClass: rtt_engine.Bot,
      };

      const opposingPlayer = game.players[(parseInt(i) + 1) % game.players.length];
      if (opposingPlayer.units.vehicles.length == 0) {
        continue;
      }
      for (let j in player.units.vehicles) {
        if (player.units.vehicles[j].orders.length > 0) {
          continue;
        }
        const target = opposingPlayer.units.vehicles[j % opposingPlayer.units.vehicles.length];
        player.units.vehicles[j].orders[0] = { kind: 'attack', target: target };
      }
    }

    const units = game.players.map((p) => p.units.vehicles).flat();
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
    console.log("game update time: " + ((new Date()) - start));

    const start2 = new Date();
    game.draw();
    for (let botPresenter of botPresenters) {
      botPresenter.draw();
    }
    for (let factoryPresenter of factoryPresenters) {
      factoryPresenter.draw();
    }
    for (let healthinessPresenter of healthinessPresenters) {
      healthinessPresenter.draw();
    }
    console.log("game draw time: " + ((new Date()) - start2));
  }, 1000 / 30);
}

main();
