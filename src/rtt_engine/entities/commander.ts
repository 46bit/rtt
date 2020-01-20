export class Commander extends Vehicle {
  energyOutput: number;

  isAlive(): boolean {
    throw new Error("Commander.isAlive not yet implemented");
  }
}
