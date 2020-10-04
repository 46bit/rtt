import * as THREE from 'three';
import { Drawable } from '../../drawer';
import { Player } from '../../../rtt_engine/player';
import { IMovable } from '../../../rtt_engine/entities';
import { Vector } from '../../../rtt_engine/vector';

export type Instance = {
  position: Vector,
  direction?: number,
  player: {color: THREE.Color} | null,
  turret?: {rotation: number}
};

export abstract class InstancedGeometryPresenter implements Drawable {
  singleGeometry: THREE.BufferGeometry;
  material: THREE.Material;
  scene: THREE.Group;
  attributes: {[key: string]: Float32Array};
  instancedGeometry?: THREE.InstancedBufferGeometry;
  allocatedInstances: number;
  mesh?: THREE.Mesh;

  constructor(singleGeometry: THREE.BufferGeometry, material: THREE.Material, scene: THREE.Group) {
    this.singleGeometry = singleGeometry;
    this.material = material;
    this.scene = scene;
    this.attributes = {};
    this.allocatedInstances = 0;
  }

  abstract getInstances(): Instance[];

  predraw(instances: any[]) {
    const numberOfInstances = instances.length;
    const sensibleInstanceAllocation = Math.max(Math.ceil(numberOfInstances / 32) * 32, 32);

    this.instancedGeometry = new THREE.InstancedBufferGeometry().copy(this.singleGeometry);
    this.instancedGeometry.instanceCount = numberOfInstances;
    this.allocatedInstances = sensibleInstanceAllocation;

    this.attributes.position = new Float32Array(sensibleInstanceAllocation * 2);
    this.instancedGeometry.setAttribute(
      "instancePosition",
      new THREE.InstancedBufferAttribute(this.attributes.position, 2),
    );

    this.attributes.rotation = new Float32Array(sensibleInstanceAllocation);
    this.instancedGeometry.setAttribute(
      "instanceRotation",
      new THREE.InstancedBufferAttribute(this.attributes.rotation, 1),
    );

    this.attributes.playerColor = new Float32Array(sensibleInstanceAllocation * 3);
    this.instancedGeometry.setAttribute(
      "playerColor",
      new THREE.InstancedBufferAttribute(this.attributes.playerColor, 3),
    );

    this.mesh = new THREE.Mesh(this.instancedGeometry, this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  draw(instances?: Instance[]) {
    instances = instances || this.getInstances();
    const numberOfInstances = instances.length;
    if (!this.instancedGeometry) {
      this.dedraw();
      this.predraw(instances);
    } else if (numberOfInstances > this.allocatedInstances) {
      this.dedraw();
      this.predraw(instances);
    } else if (numberOfInstances != this.instancedGeometry!.instanceCount) {
      this.instancedGeometry!.instanceCount = numberOfInstances;
    }

    for (let i = 0; i < numberOfInstances; i++) {
      const instance = instances[i];
      if (!instance.player) {
        continue;
      }
      this.attributes.position[i*2] = instance.position.x;
      this.attributes.position[i*2 + 1] = instance.position.y;
      const facingDirection = instance.turret ? instance.turret!.rotation : instance.direction;
      if (facingDirection != null) {
        this.attributes.rotation[i] = Math.PI/2 + facingDirection;
      }
      this.attributes.playerColor[i*3] = instance.player.color.r;
      this.attributes.playerColor[i*3 + 1] = instance.player.color.g;
      this.attributes.playerColor[i*3 + 2] = instance.player.color.b;
    }
    this.instancedGeometry!.getAttribute("instancePosition").needsUpdate = true;
    this.instancedGeometry!.getAttribute("instanceRotation").needsUpdate = true;
    this.instancedGeometry!.getAttribute("playerColor").needsUpdate = true;
  }

  dedraw() {
    if (this.instancedGeometry) {
      this.scene.remove(this.mesh!);
      this.instancedGeometry?.dispose();
      this.mesh = undefined;
      this.instancedGeometry = undefined;
      this.attributes = {};
    }
  }
}
