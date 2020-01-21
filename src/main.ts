import * as rtt_engine from './rtt_engine/index';
import * as THREE from 'three';

function main() {
  const start = new Date();
  let v = new rtt_engine.Vector(1.0, 2.0);
  let angles = 0;
  for (let i = 0; i < 1000; i++) {
    //v = new Vector(1.0, 2.0);
    //console.log(v);
    //v.x += 2;
    //console.log(v);
    v.add(new rtt_engine.Vector(7, -3));
    angles += v.angle();
    //console.log(v);
  }
  const end = new Date();
  const duration = end - start;
  console.log(duration.toLocaleString());
  console.log(v);
  console.log(angles);

  threeDemoInit();
  threeDemoAnimate();
}

var camera, scene, renderer;
var geometry, material, mesh;
var rotation, f, mesh2s;

function threeDemoInit() {
  rotation = new rtt_engine.Vector(0.1, 0);

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 1000 );
  camera.position.z = 1;

  scene = new THREE.Scene();

  geometry = new THREE.BoxGeometry( 0.05, 0.05, 0.05 );
  material = new THREE.MeshNormalMaterial();
  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  f = 0;
  mesh2s = [];
  var rotation2 = new rtt_engine.Vector(3, 0);
  for (let i = 0; i < 1000; i++) {
    var geometry2 = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
    var material2 = new THREE.MeshNormalMaterial();
    var mesh2 = new THREE.Mesh( geometry2, material );
    mesh2.position.z = -i / 3;
    mesh2.position.x = rotation2.x; // -i / 10;
    mesh2.position.y = rotation2.y; // -i / 10;
    scene.add( mesh2 );
    mesh2s.push(mesh2);
    rotation2.rotate(Math.PI / 30);
    rotation2.x *= 0.99;
    rotation2.y *= 0.99;
  }

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
}

function threeDemoAnimate() {
  requestAnimationFrame( threeDemoAnimate );
  console.log("frame " + f);

  f++;

  rotation.rotate(Math.PI / 180);

  mesh.position.x = rotation.x;
  mesh.position.y = rotation.y;

  mesh.rotation.y += 0.01;
  mesh.rotation.y += 0.02;

  var rotation2 = new rtt_engine.Vector(3, 0);
  rotation2.rotate(Math.PI / 360 * f);
  for (let mesh2 of mesh2s) {
    mesh2.position.x = rotation2.x; // -i / 10;
    mesh2.position.y = rotation2.y; // -i / 10;
    rotation2.rotate(Math.PI / 30);
    rotation2.x *= 0.99;
    rotation2.y *= 0.99;
  }

  //scene.remove( mesh );
  //mesh.position.x += 0.1;
  //material = new THREE.MeshNormalMaterial();
  //mesh = new THREE.Mesh( geometry, material );
  //scene.add( mesh );

  renderer.render( scene, camera );
}

main()
