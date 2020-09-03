import * as THREE from 'three';
import { IMap } from '../../rtt_engine/config';
import { Vector } from '../../rtt_engine/vector';

export class MapPresenter {
  map: IMap;
  scene: THREE.Group;
  mesh?: THREE.Mesh;

  constructor(map: IMap, scene: THREE.Group) {
    this.map = map;
    this.scene = scene;
  }

  predraw() {
    const geometry = new THREE.PlaneGeometry(this.map.worldSize, this.map.worldSize);
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(0) });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.x = this.map.worldSize / 2;
    this.mesh.position.y = this.map.worldSize / 2;
    this.scene.add(this.mesh);
  }

  draw() { }

  dedraw() {
    if (this.mesh != null) {
      this.scene.remove(this.mesh!);
      this.mesh = undefined;
    }
  }
}
