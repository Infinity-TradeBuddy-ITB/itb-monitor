import type ChartCore from '../ChartCore';
import type FluctuationUtils from './utils/FluctuationUtils';

export interface IPlottable {
  render: (ctx: CanvasRenderingContext2D) => void;
  update: () => void;
}

abstract class Plot<T = FluctuationUtils> implements IPlottable {
  private readonly _core: ChartCore;
  
  constructor(core: ChartCore) {
    this._core = core;
  }

  public get core() {
    return this._core;
  }

  public render(ctx: CanvasRenderingContext2D) {
    this._getDataToBeRendered().forEach((d, i) => this._drawData(ctx, d, i));
  }

  public update(): void {
    // Should overridden in specialized classes if necessary
  }

  public whenDataPushed(data: T): void {
    // Should overridden in specialized classes if necessary
  }

  protected abstract _drawData(ctx: CanvasRenderingContext2D, data: T, i: number): void;

  protected abstract _getDataToBeRendered(): T[];
}

export default Plot;
