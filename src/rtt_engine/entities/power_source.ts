import { Vector } from '../vector';
import { PowerGenerator } from './power_generator';
import { PointOfInterest } from './lib/point_of_interest';

export class PowerSource extends PointOfInterest<PowerGenerator> {
    constructor(position: Vector) {
        super({
            position,
            collisionRadius: 7.0,
        })
    }
}
