import { Vector } from './vector';
import { Obstruction } from './entities';
import TinyQueue from 'tinyqueue';

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

export function findPathWithAStar(unit: { position: Vector, collisionRadius: number }, destination: Vector, clearance: IClearance): Vector[] | undefined {
  if (unit.position.x < 0 || unit.position.y < 0 || unit.position.x >= clearance.worldSize || unit.position.y >= clearance.worldSize) {
    return undefined;
  }

  let unitCell: [number, number] = vec2cell(unit.position);
  unitCell[0] = Math.round(unitCell[0]);
  unitCell[1] = Math.round(unitCell[1]);
  let unitCellN = unitCell[0] + unitCell[1] * clearance.worldSize;

  let openSet: TinyQueue<[[number, number], number]> = new TinyQueue([[unitCell, 0]], (a, b) => a[1] - b[1]);
  let cameFrom = new Map<number, [number, number]>();
  let gScore = new Map<number, number>();
  gScore.set(unitCellN, 0);
  let fScore = new Map<number, number>();
  fScore.set(unitCellN, heuristic(unitCell, destination));
  let closed = new Set<number>();

  while (true) {
    // console.log("len " + openSet.length);
    let currentItem = openSet.pop();
    if (currentItem === undefined) {
      break;
    }
    let current = currentItem[0];
    let currentN = current[0] + current[1] * clearance.worldSize;
    if (closed.has(currentN)) {
      continue;
    }
    if (current[0] == destination.x && current[1] == destination.y) {
      return reconstructPath(cameFrom, current, clearance.worldSize);
    }
    //openSet = openSet.filter((v) => !v.equals(current!));
    closed.add(currentN);
    for (let neighbourWithCost of cellNeighboursAndCosts(...current)) {
      let neighbour: [number, number] = [neighbourWithCost[0], neighbourWithCost[1]];
      let cost = neighbourWithCost[2];
      if (neighbour[0] < 0 || neighbour[1] < 0 || neighbour[0] >= clearance.worldSize || neighbour[1] >= clearance.worldSize || closed.has(cell2str(neighbour))) {
        continue;
      }
      let neighbourClearance = clearance.cells[neighbour[1]][neighbour[0]];
      if (neighbourClearance < unit.collisionRadius) {
        continue;
      }
      let neighbourN = neighbour[0] + neighbour[1] * clearance.worldSize;
      let tentativeGScore = gScore.get(currentN)! + cost;
      let knownGScore = gScore.get(neighbourN);
      if (knownGScore == undefined || tentativeGScore < knownGScore) {
        const virtualUnit = { position: neighbour, collisionRadius: unit.collisionRadius };
        cameFrom.set(neighbourN, current);
        gScore.set(neighbourN, tentativeGScore);
        const neighbourFScore = tentativeGScore + heuristic(neighbour, destination);
        fScore.set(neighbourN, neighbourFScore);
        openSet.push([neighbour, neighbourFScore]);
      }
    }
    //openSet = _.sortBy(openSet, (v) => fScore.get(vec2str(v)));
  }
  return undefined;
}

function reconstructPath(cameFrom: Map<number, [number, number]>, current: [number, number], worldSize: number): Vector[] {
  let path = [];
  while (current != undefined) {
    path.unshift(new Vector(current[0], current[1]));
    let currentN = current[0] + current[1] * worldSize;
    current = cameFrom.get(currentN);
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
