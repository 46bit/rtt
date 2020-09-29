import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { ITitan, ITitanProjectile, TITAN_RANGE } from '../../rtt_engine/entities';
import { InstancedRotateablePresenter } from './lib';

export function titanShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(-14, 0);
  shape.lineTo(-10, 6);
  shape.lineTo(-8, 6)
  shape.lineTo(-4, 12);
  shape.lineTo(7, 12);
  shape.lineTo(12, 6);
  shape.lineTo(12, -6);
  shape.lineTo(7, -12);
  shape.lineTo(-4, -12);
  shape.lineTo(-8, -6);
  shape.lineTo(-10, -6);
  return shape;
}

export function titanTurretShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(-18, 0);
  shape.lineTo(-16, -2);
  shape.lineTo(0, -2);
  shape.lineTo(0, 2);
  shape.lineTo(-16, 2);
  return shape;
}

export class TitanPresenter extends InstancedRotateablePresenter {
  titanTurretPresenter: TitanTurretPresenter;
  constructor(player: Player, scene: THREE.Group) {
    super(
      player,
      (p) => p.units.vehicles.filter(v => v.kind == "titan"),
      new THREE.ShapeBufferGeometry(titanShape()),
      scene,
    );
    this.titanTurretPresenter = new TitanTurretPresenter(player, scene);
  }

  predraw() {
    super.predraw();
    this.titanTurretPresenter.predraw();
  }

  draw() {
    super.draw();
    this.titanTurretPresenter.draw();
  }

  dedraw() {
    super.dedraw();
    this.titanTurretPresenter.dedraw();
  }
}

export class TitanTurretPresenter extends InstancedRotateablePresenter {
  constructor(player: Player, scene: THREE.Group) {
    super(
      player,
      (p) => p.units.vehicles.filter(v => v.kind == "titan"),
      new THREE.ShapeBufferGeometry(titanTurretShape()),
      scene,
    );
  }

  draw() {
    const instances = this.instanceCallback(this.player);
    const instanceCount = instances.length;
    if (this.instancedMesh != undefined && this.instancedMesh.count != instanceCount) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh = undefined;
    }
    if (this.instancedMesh == undefined) {
      this.instancedMesh = new THREE.InstancedMesh(this.geometry!, this.material!, instanceCount);
      this.instancedMesh.count = instanceCount;
      this.instancedMesh.frustumCulled = false;
      this.scene.add(this.instancedMesh);
    }
    let m = new THREE.Matrix4();
    for (let i = 0; i < instanceCount; i++) {
      const instance = instances[i] as ITitan;
      m.makeRotationZ(-Math.PI/2 - instance.turret.rotation);
      m.setPosition(instance.position.x, instance.position.y, 0);
      this.instancedMesh.setMatrixAt(i, m);
    }
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }
}

export function titanProjectileShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(-1, -0.8);
  shape.lineTo(-1, 0.8);
  shape.lineTo(0, 1);
  shape.lineTo(0, -1);
  return shape;
}

export class TitanProjectilePresenter extends InstancedRotateablePresenter {
  constructor(player: Player, scene: THREE.Group) {
    super(
      player,
      (p) => p.units.vehicles.filter(v => v.kind == "titan"),
      new THREE.ShapeBufferGeometry(titanProjectileShape()),
      scene,
    );
    this.material!.transparent = true;
    this.material!.opacity = 0.5;
  }

  draw() {
    const instances = this.instanceCallback(this.player).filter((i) => (i as ITitan).laserStopAfter != null);
    const instanceCount = instances.length;
    if (this.instancedMesh != undefined && this.instancedMesh.count != instanceCount) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh = undefined;
    }
    if (this.instancedMesh == undefined) {
      this.instancedMesh = new THREE.InstancedMesh(this.geometry!, this.material!, instanceCount);
      this.instancedMesh.count = instanceCount;
      this.instancedMesh.frustumCulled = false;
      this.scene.add(this.instancedMesh);
    }
    let m = new THREE.Matrix4();
    let s = new THREE.Vector3(0, 1, 1);
    for (let i = 0; i < instanceCount; i++) {
      const instance = instances[i] as ITitan;
      m.makeRotationZ(-Math.PI/2 - instance.turret.rotation);
      s.x = instance.laserStopAfter!;
      m.scale(s);
      m.setPosition(instance.position.x, instance.position.y, 0);
      this.instancedMesh.setMatrixAt(i, m);
    }
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }
}
