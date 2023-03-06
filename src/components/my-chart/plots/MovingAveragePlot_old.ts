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
    this._recalculateAll();
  }

  public update(): void {
    const {t1, t2} = this.core.getConstraints().timeClip;
    const data = this.core.getData();
    const scales = this.core.getScales();
    const {x} = scales.getConstraints();
    const candlePeriod = this._period;
    const fluctuationPeriod = this._utils.getPeriod();
    const ma = this._movingAverages;

    if (x.max - x.min < fluctuationPeriod) return;

    this._utils.recalculateCandles(candlePeriod);

    if (ma.length === 0) {
      this._recalculateAll();
      return;
    }

    const ma1 = ma[0].time;
    const ma2 = ma[ma.length - 1].time;

    if (data[t1].time < ma1) {
      const left = this._calculateInRange(t1 === 0 ? t1 : t1 - 1, ma1);
      left.pop();
      this._movingAverages = left.concat(this._movingAverages);
    } else if (data[t1].time > ma1) {
      const i = this._movingAverages.findIndex(v => data[t1].time < v.time);
      this._movingAverages.splice(0, i === -1 ? this._movingAverages.length : i);
    }

    if (this._movingAverages.length === 0) return;

    if (data[t2].time < ma2) {
      const i = [...this._movingAverages].reverse().findIndex(v => data[t2].time > v.time);
      const maxIndex = this._movingAverages.length - 1;
      this._movingAverages.splice(i === -1 ? 0 : maxIndex - i, i + 1);
    } else if (data[t2].time > ma2) {
      const right = this._calculateInReverseRange(ma2, t2);
      right.splice(0, 1);
      this._movingAverages = this._movingAverages.concat(right);
    }
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

  private _recalculateAll() {
    const data = this.core.getData();
    const {t2} = this.core.getConstraints().timeClip;
    const scales = this.core.getScales();
    const {x} = scales.getConstraints();
    const period = this._period;

    if (x.max - x.min < period) return;

    const begin = this._getBegin();

    this._movingAverages = this._calculateInRange(begin, data[t2].time);
  }

  private _calculateInRange(i1: number, time: number): MovingAverage[] {
    const data = this.core.getData();
    const ma: MovingAverage[] = [];
    let i = i1;
    while (i < data.length && data[i].time <= time) {
      ma.push(this._calculateFor(i));
      i++;
    }

    return ma;
  }

  private _calculateInReverseRange(time: number, i2: number): MovingAverage[] {
    const data = this.core.getData();
    const ma: MovingAverage[] = [];
    let i = i2;
    while (data[i].time >= time) {
      ma.push(this._calculateFor(i));
      i--;
    }

    return ma.reverse();
  }

  private _calculateFor(i: number): MovingAverage {
    const data = this.core.getData();
    const period = this._period;

    if (!(i >= 0 && i < data.length)) {
      throw new Error('Index out of range!');
    }

    const d = data[i];
    const ma = {time: d.time, average: d.value};
    const limit = d.time - period;
    let n = 1;
    for (let j = i - 1; j >= 0; j--, n++) {
      if (data[j].time < limit) {
        n--;
        break;
      }

      ma.average += data[j].value;
    }

    ma.average /= n;
    return ma;
  }

  private _getBegin() {
    const {t1} = this.core.getConstraints().timeClip;
    const data = this.core.getData();
    const {x} = this.core.getScales().getConstraints();
    const beginTime = x.min + this._period > data[t1].time
      ? x.min + this._period
      : data[t1].time;
    const index = this.core.binarySearch(beginTime);
    return data[index].time < beginTime ? index + 1 : index;
  }
}

export default MovingAveragePlot;
