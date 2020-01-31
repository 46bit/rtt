import * as THREE from 'three';
import { IQuadrant } from '../../rtt_engine/quadtree';
import { Vector } from '../../rtt_engine/vector';
import { ICollidable } from '../../rtt_engine';

export class QuadtreePresenter {
  quadtree: IQuadrant<ICollidable>;
  knownQuadtree?: IQuadrant<ICollidable>;
  scene: THREE.Group;
  childScene?: THREE.Group;

  constructor(quadtree: IQuadrant<ICollidable>, scene: THREE.Group) {
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

  protected drawQuadrant(quadrant: IQuadrant<ICollidable>) {
    const planeGeometry = new THREE.PlaneGeometry(quadrant.bounds.right - quadrant.bounds.left, quadrant.bounds.bottom - quadrant.bounds.top);
    const planeEdgesGeometry = new THREE.EdgesGeometry(planeGeometry);
    const planeEdgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const planeEdgesMesh = new THREE.LineSegments(planeEdgesGeometry, planeEdgesMaterial);
    planeEdgesMesh.position.x = quadrant.bounds.left + (quadrant.bounds.right - quadrant.bounds.left) / 2;
    planeEdgesMesh.position.y = quadrant.bounds.top + (quadrant.bounds.bottom - quadrant.bounds.top) / 2;
    planeEdgesMesh.position.z = -1;
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
