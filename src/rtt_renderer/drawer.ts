export interface Drawable {
  draw(): void;
}

export class Drawer {
  pre_drawables: Drawable[];
  main_drawables: Drawable[];
  post_drawables: Drawable[];

  constructor() {
    this.pre_drawables = [];
    this.main_drawables = [];
    this.post_drawables = [];
  }

  draw() {
    for (let pre_drawable of this.pre_drawables) {
      pre_drawable.draw();
    }

    for (let main_drawable of this.main_drawables) {
      main_drawable.draw();
    }

    for (let post_drawable of this.post_drawables) {
      post_drawable.draw();
    }
  }
}
