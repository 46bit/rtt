import * as THREE from 'three';
import * as rtt_engine from './rtt_engine';
import * as rtt_threejs_renderer from './rtt_threejs_renderer';

function main() {
  const worldSize = 1600;
  let players = [
    new rtt_engine.Player(
      { name: 'red', r: 255, g: 0, b: 0 },
      new rtt_engine.Units(null),
    ),
    new rtt_engine.Player(
      { name: 'green', r: 0, g: 255, b: 0 },
      new rtt_engine.Units(null),
    )
  ];

  const renderer = new rtt_threejs_renderer.Renderer(worldSize, window, document);
  const geometry = new THREE.PlaneGeometry(worldSize, worldSize);
  var edges = new THREE.EdgesGeometry( geometry );
  var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
  renderer.scene.add(line);
  const grid = new THREE.GridHelper( worldSize, worldSize / 25 );
  grid.position.z = -0.1;
  grid.rotation.x = Math.PI / 2;
  renderer.scene.add( grid );

  const bot_geometry = new THREE.PlaneGeometry(10, 10);
  const player_materials = players.map((player) => {
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(player.color.r, player.color.g, player.color.b)
    })
  });
  let bots = [];
  let botPresenters = [];
  for (let player of players) {
    for (let i = 0; i < 500; i++) {
      const bot = new rtt_engine.Bot(
        new rtt_engine.Vector(
          (Math.random() - 0.5) * worldSize,
          (Math.random() - 0.5) * worldSize
        ),
        Math.random() * 2 * Math.PI,
        player,
        true,
      );
      bot.updateVelocity(0);
      bot.update();
      bots.push(bot);

      const botPresenter = new rtt_threejs_renderer.BotPresenter(bot, renderer.scene);
      botPresenters.push(botPresenter);
    }
  }

  renderer.animate(true);

  setInterval(() => {
    // console.log(".");
    // console.log(bot.position.x);
    // console.log(bot.position.y);
    for (let i in bots) {
      let bot = bots[i];
      if bot.position.x < -worldSize/2 || bot.position.y < -worldSize/2 || bot.position.x > worldSize/2 || bot.position.y > worldSize/2 {
      //if bot.position.magnitude() > worldSize/2) {
        if (bot.shouldTurnLeftToReach(new rtt_engine.Vector(0, 0))) {
          bot.updateVelocity(-bot.physics.turningAngle());
        } else if (bot.shouldTurnRightToReach(new rtt_engine.Vector(0, 0))) {
          bot.updateVelocity(bot.physics.turningAngle());
        } else {
          bot.updateVelocity(0, 1, false, true);
        }
      } else {
        bot.updateVelocity(0, 1, false, true);
      }
      bot.update();

      let botPresenter = botPresenters[i];
      botPresenter.draw();
    }
  }, 1000 / 30);
}

main();
