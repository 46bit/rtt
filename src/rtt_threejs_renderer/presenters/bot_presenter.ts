import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { Bot } from '../../rtt_engine/entities/bot';
import { Vector } from '../../rtt_engine/vector';

export class BotPresenter {
  player: Player;
  scene: THREE.Group;
  meshMaterial?: THREE.Material;
  circleGeometry?: THREE.BufferGeometry;
  instancedMesh?: THREE.InstancedMesh;

  constructor(player: Player, scene: THREE.Group) {
    this.player = player;
    this.scene = scene;
  }

  predraw() {
    this.meshMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(
        this.player.color.r,
        this.player.color.g,
        this.player.color.b,
      ),
    });
    this.circleGeometry = new THREE.CircleBufferGeometry(5);
  }

  draw() {
    const bots = this.player.units.vehicles.filter((v) => v instanceof Bot);
    const numberOfBots = bots.length;
    if (this.instancedMesh != undefined && this.instancedMesh.count != numberOfBots) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh = undefined;
    }
    if (this.instancedMesh == undefined) {
      this.instancedMesh = new THREE.InstancedMesh(this.circleGeometry!, this.meshMaterial!, numberOfBots);
      this.instancedMesh.count = numberOfBots;
      this.instancedMesh.frustumCulled = false;
      // this.instancedMesh.matrixAutoUpdate = true;
      // this.instancedMesh.matrixWorldNeedsUpdate = true;
      // this.instancedMesh.visible = true;
      this.scene.add(this.instancedMesh);
    }
    for (let i = 0; i < numberOfBots; i++) {
      const bot = bots[i];
      let m = new THREE.Matrix4();
      //this.instancedMesh.getMatrixAt(i, m);
      m.setPosition(bot.position.x, bot.position.y, 0);
      //m.setPosition(10, 10, 0);
      this.instancedMesh.setMatrixAt(i, m);
    }
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  dedraw() {
    if (this.instancedMesh) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh = undefined;
    }
  }
}
