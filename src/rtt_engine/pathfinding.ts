import { Vector } from './vector';
import { Obstruction } from './entities';
import TinyQueue from 'tinyqueue';
import Delaunator from 'delaunator';
import { NavMesh } from "nav2d";

export interface IClearance {
  worldSize: number;
  cells: number[][];
}

export function clearance(worldSize: number, obstructions: Obstruction[]): IClearance {
  let cells = [];
  for (let i = 0; i < worldSize; i++) {
    let row = [];
    for (let j = 0; j < worldSize; j++) {
      row.push(Infinity);
    }
    cells.push(row);
  }
  let cameFrom: Map<string, number> = new Map();
  for (let obstruction of obstructions) {
    let open: Set<string> = new Set();
    open.add(cell2str([Math.floor(obstruction.left), Math.floor(obstruction.top)]));
    let closed: Set<string> = new Set();
    while (open.size > 0) {
      let current: [number, number] = str2cell(open.values().next().value);
      open.delete(cell2str(current));
      closed.add(cell2str(current));
      let clearance;
      if (obstruction.left <= current[0]
        && obstruction.top <= current[1]
        && obstruction.right >= current[0]
        && obstruction.bottom >= current[1]) {
        clearance = 0;
      } else {
        clearance = cameFrom.get(cell2str(current))!;
      }
      cells[current[1]][current[0]] = clearance;
      for (let cellNeighboursAndCost of cellNeighboursAndCosts(current[0], current[1])) {
        let cellNeighbour: [number, number] = [cellNeighboursAndCost[0], cellNeighboursAndCost[1]];
        if (closed.has(cell2str(cellNeighbour)) || cellNeighbour[0] < 0 || cellNeighbour[1] < 0 || cellNeighbour[0] >= worldSize || cellNeighbour[1] >= worldSize) {
          continue;
        }
        let totalCost = clearance + cellNeighboursAndCost[2];
        open.add(cell2str(cellNeighbour));
        if (!cameFrom.has(cell2str(cellNeighbour)) || totalCost < cameFrom.get(cell2str(cellNeighbour))!) {
          cameFrom.set(cell2str(cellNeighbour), totalCost);
        }
      }
    }
  }
  return { worldSize, cells };
}

// var c = document.getElementsByTagName("canvas")[0];
// var ctx = c.getContext("2d");
// var imgData = ctx.createImageData(temp1.width, temp1.height);
// var max = Math.max(...temp1.cells.map((c) => Math.max(...c)));
// for (var y = 0; y < temp1.height; y++) {
//   for (var x = 0; x < temp1.width; x++) {
//     var i = y * temp1.height + x;
//     imgData.data[i * 4] = temp1.cells[y][x] / max * 255;
//     imgData.data[i * 4 + 1] = 0;
//     imgData.data[i * 4 + 2] = 0;
//     imgData.data[i * 4 + 3] = 255;
//   }
// }
// ctx.putImageData(imgData, 0, 0);

function cellNeighboursAndCosts(x: number, y: number): [number, number, number][] {
  let s = Math.sqrt(2);
  return [
    [x - 1, y, 1],
    [x, y - 1, 1],
    [x + 1, y, 1],
    [x, y + 1, 1],
    [x - 1, y - 1, s],
    [x - 1, y + 1, s],
    [x + 1, y - 1, s],
    [x + 1, y + 1, s],
  ];
}

function cell2str(cell: [number, number]): string {
  return `${cell[0]}x${cell[1]}`;
}

function str2cell(s: string): [number, number] {
  let segments = s.split("x");
  return [parseInt(segments[0]), parseInt(segments[1])];
}

function vec2cell(v: Vector): [number, number] {
  return [v.x, v.y];
}

export interface ITriangulatedMap {
  worldSize: number;
  points: [number, number][];
  pointObstruction: (number | undefined)[];
  triangles: Uint32Array;
  neighboursWithCost: [number, number][][];
  badPoints: [number, number][];
}

export function triangulate(worldSize: number, obstructions: Obstruction[]): ITriangulatedMap {
  const points: [number, number][] = [];
  points.push([0, 0]);
  points.push([0, worldSize]);
  points.push([worldSize, worldSize]);
  points.push([worldSize, 0]);
  const pointObstruction = [undefined, undefined, undefined, undefined];
  let i = 0;
  let badPoints: [number, number][] = [];
  for (let obstruction of obstructions) {
    points.push([obstruction.left, obstruction.top]);
    points.push([obstruction.right, obstruction.top]);
    points.push([obstruction.right, obstruction.bottom]);
    points.push([obstruction.left, obstruction.bottom]);
    badPoints.push([obstruction.left, obstruction.top]);
    badPoints.push([obstruction.right, obstruction.top]);
    badPoints.push([obstruction.right, obstruction.bottom]);
    badPoints.push([obstruction.left, obstruction.bottom]);
    pointObstruction.push(i, i, i, i);
    i++;
  }
  const delauneyed = Delaunator.from(points);
  const neighboursWithCost: [number, number][][] = points.map((p) => []);
  for (let i = 0; i < delauneyed.triangles.length; i += 3) {
    const p1N = delauneyed.triangles[i];
    const p2N = delauneyed.triangles[i + 1];
    const p3N = delauneyed.triangles[i + 2];
    const p1 = points[p1N];
    const p2 = points[p2N];
    const p3 = points[p3N];
    const p1ToP2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    neighboursWithCost[p1N].push([p2N, p1ToP2]);
    neighboursWithCost[p2N].push([p1N, p1ToP2]);
    const p1ToP3 = Math.hypot(p3[0] - p1[0], p3[1] - p1[1]);
    neighboursWithCost[p1N].push([p3N, p1ToP3]);
    neighboursWithCost[p3N].push([p1N, p1ToP3]);
    const p2ToP3 = Math.hypot(p3[0] - p2[0], p3[1] - p2[1]);
    neighboursWithCost[p2N].push([p3N, p2ToP3]);
    neighboursWithCost[p3N].push([p2N, p2ToP3]);
  }
  return {
    worldSize: worldSize,
    points,
    pointObstruction,
    triangles: delauneyed.triangles,
    neighboursWithCost,
    badPoints,
  };
}

export function triangulatedMapToNavMesh(triangulatedMap: ITriangulatedMap): NavMesh {
  const trianglesAsArraysOfPoints: [number, number][][] = [];
  for (let i = 0; i < triangulatedMap.triangles.length; i += 3) {
    const p1N = triangulatedMap.triangles[i];
    const p2N = triangulatedMap.triangles[i + 1];
    const p3N = triangulatedMap.triangles[i + 2];
    const p1 = triangulatedMap.points[p1N];
    const p2 = triangulatedMap.points[p2N];
    const p3 = triangulatedMap.points[p3N];
    let pointObstructions = _.uniq([p1N, p2N, p3N].map((n) => triangulatedMap.pointObstruction[n]));
    let obstructed = pointObstructions.length == 1 && pointObstructions[0] != undefined;
    if (!obstructed) {
      trianglesAsArraysOfPoints.push([p1, p2, p3]);
    }
  }
  window.trianglesAsArraysOfPoints = trianglesAsArraysOfPoints;
  return new NavMesh(trianglesAsArraysOfPoints);
}

// export interface INavMesh {
//   worldSize: number;
//   navMesh: number[][];
// }

// export function navmesh(clearance: IClearance): INavMesh {

// }

// export function findPathWithAStar(unit: { position: Vector, collisionRadius: number }, destination: Vector, triangulatedMap: ITriangulatedMap): Vector[] | undefined {
//   if (unit.position.x < 0 || unit.position.y < 0 || unit.position.x >= triangulatedMap.worldSize || unit.position.y >= triangulatedMap.worldSize) {
//     return undefined;
//   }

//   let unitCell: [number, number] = vec2cell(unit.position);
//   unitCell[0] = Math.round(unitCell[0]);
//   unitCell[1] = Math.round(unitCell[1]);

//   triangulatedMap.points.push(unitCell);
//   triangulatedMap.points.push(vec2cell(destination));

//   const pointsByCloseness = _.sortBy(triangulatedMap.points, (p) => Math.hypot(unitCell[0] - p[0], unitCell[1] - p[1]));
//   const nearestPoints_.take(nearestPoints, 3)
//   const nearestPointN = triangulatedMap.points.indexOf(nearestPoint!);

//   const nearestPointToDestination = _.sortBy(triangulatedMap.points, (p) => Math.hypot(destination.x - p[0], destination.y - p[1]));
//   const nearestPointNToDestination = triangulatedMap.points.indexOf(nearestPointToDestination!);

//   let openSet: TinyQueue<[number, number]> = new TinyQueue([[nearestPointN, 0]], (a, b) => a[1] - b[1]);
//   let cameFrom = new Map<number, number>();
//   let gScore = new Map<number, number>();
//   gScore.set(nearestPointN, 0);
//   let fScore = new Map<number, number>();
//   fScore.set(nearestPointN, heuristic(nearestPoint!, destination));
//   let closed = new Set<number>();

//   while (true) {
//     // console.log("len " + openSet.length);
//     let currentItem = openSet.pop();
//     if (currentItem === undefined) {
//       break;
//     }
//     let currentN = currentItem[0];
//     if (closed.has(currentN)) {
//       continue;
//     }
//     let current = triangulatedMap.points[currentN];
//     if (currentN == nearestPointNToDestination) {
//       const path = reconstructPath(cameFrom, currentN, triangulatedMap);
//       if (path.length > 0) {
//         if (path[0] != unit.position) {
//           path.unshift(unit.position);
//         }
//         path.push(destination);
//       }
//       return path;
//     }
//     closed.add(currentN);
//     for (let neighbourNWithCost of triangulatedMap.neighboursWithCost[currentN]) {
//       const neighbourN = neighbourNWithCost[0];
//       const neighbourCost = neighbourNWithCost[1];
//       const neighbour: [number, number] = triangulatedMap.points[neighbourN];
//       if (neighbour[0] < 0
//         || neighbour[1] < 0
//         || neighbour[0] >= triangulatedMap.worldSize
//         || neighbour[1] >= triangulatedMap.worldSize
//         || closed.has(neighbourN)) {
//         continue;
//       }
//       // let neighbourClearance = triangulatedMap.cells[neighbour[1]][neighbour[0]];
//       // if (neighbourClearance < unit.collisionRadius) {
//       //   continue;
//       // }
//       let tentativeGScore = gScore.get(currentN)! + neighbourCost;
//       let knownGScore = gScore.get(neighbourN);
//       if (knownGScore == undefined || tentativeGScore < knownGScore) {
//         const virtualUnit = { position: neighbour, collisionRadius: unit.collisionRadius };
//         cameFrom.set(neighbourN, currentN);
//         gScore.set(neighbourN, tentativeGScore);
//         const neighbourFScore = tentativeGScore + heuristic(neighbour, destination);
//         fScore.set(neighbourN, neighbourFScore);
//         openSet.push([neighbourN, neighbourFScore]);
//       }
//     }
//   }
//   return undefined;
// }

function reconstructPath(cameFrom: Map<number, number>, currentN: number | undefined, triangulatedMap: ITriangulatedMap): Vector[] {
  let path = [];
  while (currentN != undefined) {
    const current = triangulatedMap.points[currentN];
    path.unshift(new Vector(current[0], current[1]));
    currentN = cameFrom.get(currentN);
  }
  return path;
}

function heuristic(from: [number, number], destination: Vector): number {
  return Math.hypot(destination.x - from[0], destination.y - from[1]);
}

function neighbours(of: Vector): Vector[] {
  return [
    new Vector(of.x - 1, of.y),
    new Vector(of.x, of.y - 1),
    new Vector(of.x + 1, of.y),
    new Vector(of.x, of.y + 1),
    new Vector(of.x - 1, of.y - 1),
    new Vector(of.x - 1, of.y + 1),
    new Vector(of.x + 1, of.y + 1),
    new Vector(of.x + 1, of.y - 1),
  ];
}

function vec2str(v: Vector): string {
  return `Vector[${v.x}, ${v.y}]`;
}
