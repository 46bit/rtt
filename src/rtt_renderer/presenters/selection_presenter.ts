import * as THREE from 'three';
import { Selection } from '../selection';

export class SelectionPresenter {
  selection: Selection;
  scene: THREE.Group;
  selectionCircle?: THREE.Mesh;
  selectedEntityOutlines: { [entityId: string]: THREE.Mesh };

  constructor(selection: Selection, scene: THREE.Group) {
    this.selection = selection;
    this.scene = scene;
    this.selectedEntityOutlines = {};
  }

  predraw() {
    this.selectionCircle = undefined;
    this.selectedEntityOutlines = {};
  }

  draw() {
    if (this.selection.selectionInProgress && this.selection.selectionCentre) {
      this.drawSelection();
    } else if (this.selectionCircle) {
      this.scene.remove(this.selectionCircle);
      this.selectionCircle = undefined;
    }

    this.drawSelectedEntities();
  }

  drawSelection() {
    if (!this.selectionCircle) {
      // FIXME: Use a custom ring geometry as described for drawSelectedEntities, instead of a circle
      const geometry = new THREE.CircleBufferGeometry(1, 32);
      const material = new THREE.MeshBasicMaterial({ color: "white", opacity: 0.3 });
      material.blending = THREE.AdditiveBlending;
      material.transparent = true;
      this.selectionCircle = new THREE.Mesh(geometry, material);
      this.selectionCircle.position.z = 10;
      this.scene.add(this.selectionCircle);
    }
    this.selectionCircle.scale.x = this.selection.selectionRadius!;
    this.selectionCircle.scale.y = this.selection.selectionRadius!;
    this.selectionCircle.position.x = this.selection.selectionCentre!.x;
    this.selectionCircle.position.y = this.selection.selectionCentre!.y;
    this.selectionCircle.updateMatrix();
  }

  drawSelectedEntities() {
    let activeEntityIds: {[id: string]: boolean} = {};

    // FIXME: Use geometry instancing for this (n.b., will need to use custom geometry
    // because naively scaling a ring geometry varies the ring thickness too)
    for (let id in this.selection.selectedEntities) {
      let selected = this.selection.selectedEntities[id];
      // FIXME: Think through what to with playerless units
      if (!selected.player) {
        continue;
      }

      activeEntityIds[id] = true;

      if (!this.selectedEntityOutlines[id]) {
        const geo = new THREE.RingBufferGeometry(selected.collisionRadius * 1.5, selected.collisionRadius * 1.5 + 4, 16);
        let material = new THREE.MeshBasicMaterial({ color: selected.player.color, opacity: 0.5 });
        material.blending = THREE.AdditiveBlending;
        this.selectedEntityOutlines[id] = new THREE.Mesh(geo, material);
        this.scene.add(this.selectedEntityOutlines[id]);
      }

      this.selectedEntityOutlines[id].position.x = selected.position.x;
      this.selectedEntityOutlines[id].position.y = selected.position.y;
    }

    for (let id in this.selectedEntityOutlines) {
      if (!(id in activeEntityIds)) {
        this.scene.remove(this.selectedEntityOutlines[id]);
        delete(this.selectedEntityOutlines[id]);
      }
    }
  }

  dedraw() {
    if (this.selectionCircle) {
      this.scene.remove(this.selectionCircle);
      this.selectionCircle = undefined;
    }
    for (let id in this.selectedEntityOutlines) {
      let selectionBox = this.selectedEntityOutlines[id];
      this.scene.remove(selectionBox);
    }
    this.selectedEntityOutlines = {};
  }
}
