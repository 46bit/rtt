import * as THREE from 'three';
import { Vector } from '../../rtt_engine/vector';
import { ITriangulatedMap } from '../../rtt_engine';

export class TriangulatedMapPresenter {
  triangulatedMap: ITriangulatedMap;
  scene: THREE.Group;
  childScene?: THREE.Group;

  constructor(triangulatedMap: ITriangulatedMap, scene: THREE.Group) {
    this.triangulatedMap = triangulatedMap;
    this.scene = scene;
  }

  predraw() {
    this.childScene = new THREE.Group();
    for (let passableTriangle of this.triangulatedMap.passableTriangles) {
      let coords = passableTriangle.map((i) => this.triangulatedMap.points[i]);
      this.drawTriangle(coords);
    }
    this.scene.add(this.childScene);
  }

  draw() { }

  protected drawTriangle(points: [number, number][]) {
    let geometry = new THREE.Geometry();
    let vertices = points.map((p) => new THREE.Vector3(p[0], p[1], 2));
    console.log(vertices);
    geometry.vertices.push(...vertices);
    geometry.faces.push(new THREE.Face3(0, 1, 2));
    geometry.faces.push(new THREE.Face3(2, 1, 0));
    geometry.faces.push(new THREE.Face3(2, 0, 1));
    geometry.computeFaceNormals();
    let material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(Math.random() * 0xffffff),
      opacity: 0.5,
    });
    material.transparent = true;
    let mesh = new THREE.Mesh(geometry, material);
    this.childScene!.add(mesh);
  }

  dedraw() {
    if (this.childScene != null) {
      this.scene.remove(this.childScene);
      // FIXME: stop leaking the geometry and mesh and scene
      this.childScene = undefined;
    }
  }
}
