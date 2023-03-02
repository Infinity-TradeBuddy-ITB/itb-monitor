import {type Fluctuation} from '../CandleStickChart';
import Plot from './Plot';

export interface PeriodFluctuation {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

class CandlePlot extends Plot<PeriodFluctuation> {
  private _candles: PeriodFluctuation[] = [];
  private readonly _period = 20000;

  public update(): void {
    this._updateCandles();
  }

  protected _drawData(ctx: CanvasRenderingContext2D, data: PeriodFluctuation, i: number): void {
    const {getPixelForDate, getPixelForPrice} = this.core.getScales();
    const gap = this._period * 0.4;
    const t1 = getPixelForDate(data.time - gap);
    const t2 = getPixelForDate(data.time + gap);
    const o = getPixelForPrice(data.open);
    const c = getPixelForPrice(data.close);
    const h = getPixelForPrice(data.high);
    const l = getPixelForPrice(data.low);
    const t = (t1 + t2) / 2;

    ctx.lineWidth = 1;

    if (data.open > data.close) {
      ctx.strokeStyle = 'rgba(224, 65, 65, 1)';
      ctx.fillStyle = 'rgba(224, 65, 65, 1)';
      ctx.fillRect(t1, o, t2 - t1, c - o);
    } else if (data.open < data.close) {
      ctx.strokeStyle = 'rgba(95, 199, 111, 1)';
      ctx.fillStyle = 'rgba(95, 199, 111, 1)';
      ctx.fillRect(t1, c, t2 - t1, o - c);
    } else {
      ctx.strokeStyle = 'rgba(210, 210, 210, 1)';
      ctx.beginPath();
      ctx.moveTo(t1, o);
      ctx.lineTo(t2, o);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(t, h);
    ctx.lineTo(t, l);
    ctx.stroke();
  }

  protected _getDataToBeRendered(): PeriodFluctuation[] {
    return this._candles;
  }

  private _updateCandles(): void {
    this._candles = [];
    const data = this.core.getData();
    const {t1, t2} = this.core.getConstraints().timeClip;

    let p1 = t1;
    let p2 = t2;

    if (t1 > 0 && data[t1].time % this._period !== 0) {
      const t1Period = this._getPeriodInTime(data[t1].time);
      for (let i = t1 - 1; i >= 0; i--) {
        if (i === 0) {
          p1 = i;
          break;
        }

        if (data[i].time < t1Period) {
          p1 = i + 1;
          break;
        }
      }
    }

    if (t2 + 1 < data.length && data[t2].time % this._period !== 0) {
      const t2Period = this._getPeriodInTime(data[t2 + 1].time);
      for (let i = t2 + 1; i < data.length; i++) {
        if (i + 1 === data.length || data[i].time === t2Period) {
          p2 = i;
          break;
        }
      }
    }

    const candlePointer: [PeriodFluctuation | null] = [null];

    data.slice(p1, p2).forEach((d, i, arr) => this._computeCandle(candlePointer, d, i, arr));
  }

  private _computeCandle(c: [PeriodFluctuation | null], d: Fluctuation, i: number, arr: Fluctuation[]): void {
    const currentPeriod = this._getPeriodInTime(d.time);
    const nextPeriod = i === arr.length - 1 
      ? currentPeriod 
      : this._getPeriodInTime(arr[i + 1].time);

    if (i === 0 || (c[0] && c[0].time < currentPeriod)) {
      c[0] = {
        time: currentPeriod,
        open: d.value,
        close: 0,
        high: 0,
        low: -1,
      };
    }

    const candle = c[0];

    if (!candle) return;
    
    if (i === arr.length - 1 || currentPeriod < nextPeriod) {
      candle.close = d.value;
      this._candles.push(candle);
    }

    if (candle.high < d.value) {
      candle.high = d.value;
    }

    if (candle.low < 0 || candle.low > d.value) {
      candle.low = d.value;
    }
  }

  private _getBeginTime() {
    const b = this.core.getData()[0].time;
    const fix = b % this._period;
    return b - this._period + fix;
  }

  private _periodCount(t: number) {
    return Math.floor((t - this._getBeginTime()) / this._period);
  }

  private _getPeriodInTime(t: number) {
    return this._getBeginTime() + this._periodCount(t) * this._period;
  }
}

export default CandlePlot;
