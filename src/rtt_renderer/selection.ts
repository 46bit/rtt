import * as THREE from 'three';
import { Game, Player, Vector, IQuadrant, ICollidable } from '../rtt_engine';
import { Entity, Projectile } from '../rtt_engine/entities/lib';

export type IClickEvent = {clientX: number; clientY: number; button: Button};

export enum Button {
  LeftClick = 0,
  RightClick = 2,
}

export class Selection {
  game: Game;
  screenPositionToWorldPosition: ScreenPositionToWorldPosition;
  selectionInProgress: boolean;
  selectionStart?: Vector;
  selectionEnd?: Vector;
  selectionCentre?: Vector;
  selectionRadius?: number;
  selectedEntities: Entity[];
  target?: Vector | Entity;
  selectedPlayer: Player | null;

  constructor(game: Game, screenPositionToWorldPosition: ScreenPositionToWorldPosition) {
    this.game = game;
    this.screenPositionToWorldPosition = screenPositionToWorldPosition;
    this.selectionInProgress = false;
    this.selectedEntities = [];
    this.selectedPlayer = null;
  }

  mousedown(event: IClickEvent) {
    let worldPosition = this.screenPositionToWorldPosition.convert(event.clientX, event.clientY);
    if (!worldPosition) {
      return;
    }

    if (event.button == Button.LeftClick) {
      this.selectionInProgress = true;
      this.selectionStart = worldPosition;
      this.selectionEnd = undefined;
      this.selectionCentre = undefined;
      this.selectionRadius = undefined;
      this.selectedEntities = [];
      this.target = undefined;
    } else if (event.button == Button.RightClick && this.selectedEntities.length > 0) {
      // FIXME: See if anything is at the current location
      // FIXME: Move selected entities to attack the entity being right clicked, or move to the location,
      // or build at this location if it's a commander?
      // FIXME: Just record this info on the class, then figure out how to process the info outside
      // this class?
      this.target = worldPosition;
      this.selectedEntities.forEach((entity) => {
        // FIXME: There needs to be a better way to check for abilities than checking for fields…
        if (entity.orders && entity.velocity) {
          entity.orders[0] = {
            kind: 'manoeuvre',
            destination: worldPosition,
          };
        }
      })
    }
  }

  mousemove(event: IClickEvent) {
    if (event.button != Button.LeftClick || !this.selectionInProgress) {
      return;
    }

    let worldPosition = this.screenPositionToWorldPosition.convert(event.clientX, event.clientY);
    if (!worldPosition) {
      return;
    }
    this.selectionEnd = worldPosition;
    this.selectionRadius = Vector.distance(this.selectionStart!, this.selectionEnd!) / 2;
    this.selectionCentre = new Vector(
      (this.selectionStart!.x + this.selectionEnd!.x) / 2,
      (this.selectionStart!.y + this.selectionEnd!.y) / 2,
    );
  }

  mouseup(event: IClickEvent, quadtree: IQuadrant<ICollidable>) {
    if (!this.selectionInProgress || event.button != Button.LeftClick) {
      return;
    }

    this.mousemove(event);

    this.selectionInProgress = false;
    // FIXME: Try to cut down on some of this allocation?
    this.selectedEntities = quadtree.getCollisionsFor({
      collisionRadius: this.selectionRadius,
      position: this.selectionCentre,
      player: null,
    }).filter((entity) => !(entity instanceof Projectile));
    if (this.selectedPlayer) {
      this.selectedEntities = this.selectedEntities.filter((e) => e.player == this.selectedPlayer);
    }
  }

  update() {
    // FIXME: `this.selectedEntities` is a list, filter out instead of creating holes in it!
    for (let id in this.selectedEntities) {
      const entity = this.selectedEntities[id];
      if (entity.dead) {
        delete (this.selectedEntities[id])
      }
    }
  }
}

export class ScreenPositionToWorldPosition {
  rendererDomElement: any;
  camera: THREE.Camera;

  constructor(rendererDomElement: any, camera: THREE.Camera) {
    this.rendererDomElement = rendererDomElement;
    this.camera = camera;
  }

  convert(clientX: number, clientY: number): Vector | undefined {
    // FIXME: This must encode the coordinate system being used. That coordinate system really,
    // really needs documenting.
    const normalisedX = clientX / parseInt(this.rendererDomElement.style.width) * 2 - 1;
    const normalisedY = - clientY / parseInt(this.rendererDomElement.style.height) * 2 + 1;
    const normalisedMousePosition = new THREE.Vector2(normalisedX, normalisedY);

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(normalisedMousePosition, this.camera);

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1));
    const result = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, result);

    return new Vector(
      result.x,
      result.y,
    );
  }
}
