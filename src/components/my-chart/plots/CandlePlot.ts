import type ChartCore from '../ChartCore';
import Plot from './Plot';
import FluctuationUtils, {type PeriodFluctuation} from './utils/FluctuationUtils';

class CandlePlot extends Plot<PeriodFluctuation> {
  private readonly _utils: FluctuationUtils;

  constructor(core: ChartCore) {
    super(core);
    this._utils = new FluctuationUtils(core, 20000);
    this._utils.recalculateCandles();
  }

  public update(): void {
    this._utils.recalculateCandles();
  }

  protected _drawData(ctx: CanvasRenderingContext2D, data: PeriodFluctuation, i: number): void {
    const {getPixelForDate, getPixelForPrice} = this.core.getScales();
    const period = this._utils.getPeriod();
    const gap = period * 0.4;
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
    return this._utils.getCandles();
  }
}

export default CandlePlot;
