import {type Fluctuation} from '../CandleStickChart';
import Plot from './Plot';

interface MovingAverage {
  time: number;
  average: number;
}

class MovingAveragePlot extends Plot<MovingAverage> {
  private _movingAverages: MovingAverage[] = [];
  private readonly _period = 30000;

  public update(): void {
    this._movingAverages = [];
    const {t1, t2} = this.core.getConstraints().timeClip;
    const data = this.core.getData();
    const scales = this.core.getScales();
    const {x} = scales.getConstraints();
    const period = this._period;

    if (x.max - x.min < period) return;

    const begin = this._getBegin();

    for (let i = begin; i <= t2; i++) {
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
      this._movingAverages.push(ma);
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
