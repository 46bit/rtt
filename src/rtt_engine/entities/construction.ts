export class Construction {
  kind: string;
  unit: any;

  isComplete(): boolean {
    throw new Error("Construction.isComplete not yet implemented");
  }
}
