import { PowerSource } from './power_source';

export class PowerGenerator {
  source: PowerSource;
  energyOutput: number;

  isAlive(): boolean {
    throw new Error("PowerGenerator.isAlive not yet implemented");
  }
}
