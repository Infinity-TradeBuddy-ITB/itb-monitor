import {type Fluctuation} from '../Chart';
import Plot from './Plot';

class LinePlot extends Plot {
  private _dataOnScreen!: Fluctuation[];

  public update(): void {
    const {t1, t2} = this.core.getConstraints().timeClip;
    this._dataOnScreen = this.core.getData().slice(t1, t2);
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'rgba(150, 177, 255, 1)';
    ctx.beginPath();

    super.render(ctx);

    ctx.stroke();
  }

  protected _drawData(ctx: CanvasRenderingContext2D, data: Fluctuation, i: number): void {
    const {getPixelForDate, getPixelForPrice} = this.core.getScales();

    if (i === 0) {
      ctx.moveTo(getPixelForDate(data.time), getPixelForPrice(data.value));
      return;
    }

    ctx.lineTo(getPixelForDate(data.time), getPixelForPrice(data.value));
  }

  protected _getDataToBeRendered(): Fluctuation[] {
    return this._dataOnScreen;
  }
}

export default LinePlot;
