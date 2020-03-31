import { Vector } from './vector';
import { Obstruction } from './entities';
import TinyQueue from 'tinyqueue';
import { NavMesh } from "nav2d";
import cleanPSLG from "clean-pslg";
import cdt2d from "cdt2d";

export interface ITriangulatedMap {
  worldSize: number;
  points: [number, number][];
  triangles: [number, number, number][];
  passableTriangles: [number, number, number][];
}

export function triangulate(worldSize: number, obstructions: Obstruction[]): ITriangulatedMap {
  const points: [number, number][] = [];
  const boundaryEdges: [number, number][] = [];

  // Add the world boundaries
  points.push([0, 0]);
  points.push([0, worldSize]);
  points.push([worldSize, worldSize]);
  points.push([worldSize, 0]);
  boundaryEdges.push([0, 1]);
  boundaryEdges.push([1, 2]);
  boundaryEdges.push([2, 3]);
  boundaryEdges.push([3, 0]);

  // Add the obstructions
  for (let obstruction of obstructions) {
    const startIndex = points.length;
    points.push([obstruction.left, obstruction.top]);
    points.push([obstruction.right, obstruction.top]);
    points.push([obstruction.right, obstruction.bottom]);
    points.push([obstruction.left, obstruction.bottom]);
    boundaryEdges.push([startIndex, startIndex+1]);
    boundaryEdges.push([startIndex+1, startIndex+2]);
    boundaryEdges.push([startIndex+2, startIndex+3]);
    boundaryEdges.push([startIndex+3, startIndex]);
  }

  if (!cleanPSLG(points, boundaryEdges)) {
    alert("cleaning the map before triangulation failed. sorry. contact the author :(");
  }

  const triangles = cdt2d(points, boundaryEdges);

  const passableTriangles: [number, number, number][] = [];
  for (let triangle of triangles) {
    let trianglePoints = triangle.map((i) => points[i]);
    let centreOfTriangle = [
      _.sum(trianglePoints.map((p) => p[0])) / 3,
      _.sum(trianglePoints.map((p) => p[1])) / 3,
    ];
    let obstructed = false;
    for (let obstruction of obstructions) {
      if (obstruction.left < centreOfTriangle[0]
        && obstruction.right > centreOfTriangle[0]
        && obstruction.top < centreOfTriangle[1]
        && obstruction.bottom > centreOfTriangle[1]) {
        obstructed = true;
        break;
      }
    }
    if (!obstructed) {
      passableTriangles.push(triangle);
    }
  }

  return {
    worldSize,
    points,
    triangles,
    passableTriangles,
  };
}

export function triangulatedMapToNavMesh(triangulatedMap: ITriangulatedMap): NavMesh {
  const trianglesAsArraysOfPoints = triangulatedMap.passableTriangles.map((triangle) => {
    return triangle.map((i) => triangulatedMap.points[i]);
  });
  return new NavMesh(trianglesAsArraysOfPoints);
}
