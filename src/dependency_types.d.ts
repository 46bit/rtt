type Point = [number, number];
type Edge = [number, number];

declare module "cdt2d" {
  type Triangle = [number, number, number];
  function cdt2d(points: Point[], edges: Edge[], options?: any): Triangle[];
  export = cdt2d;
}

declare module "clean-pslg" {
  function cleanPSLG(points: Point[], edges: Edge[], colors?: string[]): void;
  export = cleanPSLG;
}

declare module "navmesh" {
  type Point = {x: number, y: number};
  class NavMesh {
    constructor(meshPolygonPoints: Point[][], meshShrinkAmount?: number);
    findPath(start: Point, end: Point): Point[] | null;
  }
  export = NavMesh;
}
