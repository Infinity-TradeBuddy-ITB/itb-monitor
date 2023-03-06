import type CandleStickChartCore from '../../CandleStickChartCore';

export interface Fluctuation {
  time: number;
  value: number;
}

export interface PeriodFluctuation {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

class FluctuationUtils {
  private readonly _core: CandleStickChartCore;
  private _candles: PeriodFluctuation[];
  private _period: number;

  constructor(core: CandleStickChartCore, period: number) {
    this._core = core;
    this._candles = [];
    this._period = period;

    this.setPeriod = this.setPeriod.bind(this);
    this.getPeriod = this.getPeriod.bind(this);
    this.getCandles = this.getCandles.bind(this);

    this.computeCandle = this.computeCandle.bind(this);
    this.getLowerLimit = this.getLowerLimit.bind(this);
    this.getUpperLimit = this.getUpperLimit.bind(this);
    this.recalculateCandles = this.recalculateCandles.bind(this);
  }

  public recalculateCandles(startOffset = 0) {
    this._candles = [];
    const data = this._core.getData();

    const l1 = this.getLowerLimit(startOffset);
    const l2 = this.getUpperLimit();

    const candlePointer: [PeriodFluctuation | null] = [null];

    data.slice(l1, l2).forEach((d, i, arr) => this.computeCandle(candlePointer, d, i, arr));
  }

  public getUpperLimit() {
    const data = this._core.getData();
    const {t2} = this._core.getConstraints().timeClip;
    const {getPeriodInTime} = this._core.getScales();
    const period = this._period;

    if (t2 + 1 === data.length) {
      return t2;
    } 

    if (t2 + 1 < data.length && data[t2].time % period === 0) {
      return t2 + 1;
    }
    
    if (t2 + 1 < data.length) {
      const t2Period = getPeriodInTime(data[t2].time, period) + period * 2;
      for (let i = t2 + 1; i < data.length; i++) {
        if (i + 1 === data.length) {
          return i;
        }

        if (data[i].time > t2Period) {
          return i;
        }
      }
    }

    return 0;
  }

  public getLowerLimit(startOffset = 0) {
    const data = this._core.getData();
    const {t1} = this._core.getConstraints().timeClip;
    const {getPeriodInTime} = this._core.getScales();
    const {x} = this._core.getScales().getConstraints();
    const period = this._period;

    if (t1 > 0 && data[t1].time % period === 0) {
      return t1;
    }
    
    if (t1 > 0 && data[t1].time % period !== 0) {
      const p = getPeriodInTime(data[t1].time, period);
      const t1Period = p - startOffset * period;

      if (t1Period <= x.min) return 0;

      for (let i = t1 - 1; i >= 0; i--) {
        if (i === 0) {
          return i;
        }

        if (data[i].time < t1Period) {
          return i - 1;
        }
      }
    }

    return 0;
  }

  public computeCandle(
    c: [PeriodFluctuation | null], 
    d: Fluctuation, 
    i: number, 
    arr: Fluctuation[],
  ): void {
    const {getPeriodInTime} = this._core.getScales();
    const period = this._period;
    const currentPeriod = getPeriodInTime(d.time, period);
    const nextPeriod = i === arr.length - 1 
      ? currentPeriod 
      : getPeriodInTime(arr[i + 1].time, period);
  
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

  public setPeriod(period: number) {
    this._period = period;
  }

  public getPeriod() {
    return this._period;
  }

  public getCandles(): PeriodFluctuation[] {
    return this._candles;
  }
}

export default FluctuationUtils;
