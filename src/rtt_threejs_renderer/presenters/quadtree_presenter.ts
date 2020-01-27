import * as THREE from 'three';
import { IEntityQuadtree } from '../../rtt_engine/quadtree';
import { Vector } from '../../rtt_engine/vector';
import { IEntityConfig } from '../../rtt_engine';

export class QuadtreePresenter {
  quadtree: IEntityQuadtree<IEntityConfig>;
  knownQuadtree?: IEntityQuadtree<IEntityConfig>;
  scene: THREE.Group;
  childScene?: THREE.Group;

  constructor(quadtree: IEntityQuadtree<IEntityConfig>, scene: THREE.Group) {
    this.quadtree = quadtree;
    this.scene = scene;
  }

  predraw() {}

  draw() {
    if (this.knownQuadtree != null && this.quadtree != this.knownQuadtree) {
      this.dedraw();
    }
    if (this.quadtree != this.knownQuadtree) {
      this.knownQuadtree = this.quadtree;
      this.childScene = new THREE.Group();
      this.scene.add(this.childScene);
      this.drawQuadrant(this.quadtree);
    }
  }

  protected drawQuadrant(quadrant: IEntityQuadtree<IEntityConfig>) {
    const planeGeometry = new THREE.PlaneGeometry(quadrant.right - quadrant.left, quadrant.bottom - quadrant.top);
    const planeEdgesGeometry = new THREE.EdgesGeometry(planeGeometry);
    const planeEdgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const planeEdgesMesh = new THREE.LineSegments(planeEdgesGeometry, planeEdgesMaterial);
    planeEdgesMesh.position.x = quadrant.left + (quadrant.right - quadrant.left) / 2;
    planeEdgesMesh.position.y = quadrant.top + (quadrant.bottom - quadrant.top) / 2;
    this.childScene!.add(planeEdgesMesh);

    if (quadrant.subtrees != null) {
      for (let childQuadrant of quadrant.subtrees) {
        this.drawQuadrant(childQuadrant);
      }
    }
  }

  dedraw() {
    if (this.childScene != null) {
      this.scene.remove(this.childScene);
      this.childScene = undefined;
    }
  }
}
