export class Construction {
  public kind: string;
  public unit: any;

  public isComplete(): boolean {
    throw new Error('Construction.isComplete not yet implemented');
  }
}
