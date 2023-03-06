import type CandleStickChartCore from '../CandleStickChartCore';
import Plot from './Plot';
import FluctuationUtils from './utils/FluctuationUtils';

interface MovingAverage {
  time: number;
  average: number;
}

class MovingAveragePlot extends Plot<MovingAverage> {
  private _movingAverages: MovingAverage[] = [];
  private readonly _period = 5;
  private readonly _utils: FluctuationUtils;

  constructor(core: CandleStickChartCore) {
    super(core);
    this._utils = new FluctuationUtils(core, 20000);
    this._utils.recalculateCandles();
  }

  public update(): void {
    const scales = this.core.getScales();
    const {x} = scales.getConstraints();
    const candlePeriod = this._period;
    const fluctuationPeriod = this._utils.getPeriod();

    if (x.max - x.min < fluctuationPeriod) return;

    this._utils.recalculateCandles(candlePeriod);
    const candles = this._utils.getCandles();

    this._movingAverages = [];

    candles.forEach((c, i) => {
      if (i < candlePeriod) return;
      const ma = {time: c.time, average: c.close};

      for (let j = 1; j < candlePeriod; j++) {
        ma.average += candles[i - j].close;
      }

      ma.average /= candlePeriod;
      this._movingAverages.push(ma);
    });

    console.log(this._utils.getCandles().length);
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'rgba(255, 177, 150, 1)';
    ctx.beginPath();

    super.render(ctx);

    ctx.stroke();
  }

  protected _drawData(ctx: CanvasRenderingContext2D, data: MovingAverage, i: number): void {
    const {getPixelForDate, getPixelForPrice} = this.core.getScales();

    if (i === 0) {
      ctx.moveTo(getPixelForDate(data.time), getPixelForPrice(data.average));
      return;
    }

    ctx.lineTo(getPixelForDate(data.time), getPixelForPrice(data.average));
  }

  protected _getDataToBeRendered(): MovingAverage[] {
    return this._movingAverages;
  }
}

export default MovingAveragePlot;
