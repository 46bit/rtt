import * as rtt_engine from './rtt_engine/index';

function main() {
  const start = new Date();
  let v = new rtt_engine.Vector(1.0, 2.0);
  let angles = 0;
  for (let i = 0; i < 1000000000; i++) {
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
}

main()
