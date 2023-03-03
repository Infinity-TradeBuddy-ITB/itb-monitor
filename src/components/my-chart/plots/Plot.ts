import {type Fluctuation} from '../CandleStickChart';
import type CandleStickChartCore from '../CandleStickChartCore';

export interface IPlottable {
  render: (ctx: CanvasRenderingContext2D) => void;
  update: () => void;
}

abstract class Plot<T = Fluctuation> implements IPlottable {
  private readonly _core: CandleStickChartCore;
  
  constructor(core: CandleStickChartCore) {
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
