import * as THREE from 'three';
import * as rtt_engine from './rtt_engine';
import * as rtt_threejs_renderer from './rtt_threejs_renderer';

function main() {
  const map = {
    name: 'test-map',
    worldSize: 800,
    powerGenerators: [
      new rtt_engine.Vector(100, 100),
      new rtt_engine.Vector(100, 700),
      new rtt_engine.Vector(700, 100),
      new rtt_engine.Vector(700, 700),
    ],
  };
  const config = {
    map,
    unitCap: 200,
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

  const grid = new THREE.GridHelper(map.worldSize, map.worldSize / 25);
  grid.position.z = -0.1;
  grid.rotation.x = Math.PI / 2;
  renderer.scene.add(grid);

  let game = rtt_engine.gameFromConfig(config, renderer.gameCoordsGroup);
  for (let player of game.players) {
    for (let i = 0; i < 500; i++) {
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
  for (let i in game.players) {
    const player = game.players[i];
    for (let j in player.units.vehicles) {
      const k = (parseInt(i) + 1) % game.players.length;
      console.log(k);
      const target = game.players[k].units.vehicles[j];
      player.units.vehicles[j].orders[0] = { kind: 'attack', target: target };
    }
  }
  setInterval(() => {

    game.update();
    game.draw();
  }, 1000 / 30);
}

main();
