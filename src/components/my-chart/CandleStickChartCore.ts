import {type Fluctuation} from './CandleStickChart';
import Scales from './Scales';

class CandleStickChartCore {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _ctx: CanvasRenderingContext2D;
  private readonly _scales: Scales;
  private readonly _data: Fluctuation[];
  private readonly _constraints = {
    margin: 16,
    timeClip: {
      t1: 0,
      t2: 0,
    },
    shouldStop: false,
    shouldUpdate: false,
    shouldRender: false,
  };

  constructor(canvas: HTMLCanvasElement, data: Fluctuation[]) {
    this._canvas = canvas;
    this._data = data;

    this.fromBottom = this.fromBottom.bind(this);
    this.fromRight = this.fromRight.bind(this);
    this.updateTimeClip = this.updateTimeClip.bind(this);
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.destroy = this.destroy.bind(this);
    this._loop = this._loop.bind(this);

    this._scales = new Scales(this);
    this.updateTimeClip();

    canvas.width = window.innerWidth - 16;
    canvas.height = window.innerHeight - 16;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not initialized!');
    this._ctx = ctx;
    this._loop();
  }

  public push(data: Fluctuation) {
    this._data.push(data);
    this._constraints.shouldUpdate = true;
  }

  public fromBottom(y: number) {
    return this._canvas.height - y;
  }

  public fromRight(x: number) {
    return this._canvas.width - x;
  }

  public getConstraints() {
    return this._constraints;
  }

  public getCanvas() {
    return this._canvas;
  }

  public getData() {
    return this._data;
  }

  public updateTimeClip() {
    const {x} = this._scales.getConstraints();
    const {timeClip} = this._constraints;
    const data = this._data;

    timeClip.t1 = this._binarySearch(x.clipBase);
    if (timeClip.t1 > 0 && data[timeClip.t1].time > x.clipBase) {
      timeClip.t1--;
    }

    timeClip.t2 = this._binarySearch(x.clipMax);
    if (timeClip.t2 < (data.length - 1) && data[timeClip.t2].time < (x.clipMax)) {
      timeClip.t2++;
    }
  }

  public destroy() {
    this._constraints.shouldStop = true;
  }

  public update() {
    if (!this._constraints.shouldUpdate) return;
    this._scales.update();
    this.updateTimeClip();
    this._constraints.shouldUpdate = false;
    this._constraints.shouldRender = true;
  }

  public render() {
    if (!this._constraints.shouldRender) return;
    const ctx = this._ctx;
    this._drawBackground(ctx);
    this._scales.drawAxies(ctx);
    this._scales.drawMeasures(ctx);
    this._plot(ctx);
    this._constraints.shouldRender = false;
  }

  private _loop() {
    this.update();
    this.render();
    if (this._constraints.shouldStop) return;
    requestAnimationFrame(this._loop);
  }

  private _binarySearch(time: number): number {
    const {floor} = Math;
    const data = this._data;

    let min = 0;
    let max = data.length - 1;
    let pivot = floor(max / 2);
    while (pivot !== min && pivot !== max) {
      const t = data[pivot].time;
      if (time > t) {
        min = pivot;
        pivot += floor((max - pivot) / 2);
      } else if (time < t) {
        max = pivot;
        pivot -= floor((pivot - min) / 2);
      } else if (t === time) {
        break;
      }
    }

    return pivot;
  }

  private _plot(ctx: CanvasRenderingContext2D) {
    const {margin} = this._constraints;
    const {getPixelForPrice, getPixelForDate} = this._scales;
    const {x, y, size} = this._scales.getConstraints();
    const {t1, t2} = this._constraints.timeClip;
    const data = this._data;

    if (data.length < 1) return;

    ctx.save();
    ctx.rect(margin + size.x, margin, x.dx, y.dy);
    ctx.clip();

    ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
    ctx.beginPath();
    ctx.moveTo(getPixelForDate(data[t1].time), getPixelForPrice(data[t1].value));

    for (let i = t1 + 1; i <= t2; i++) {
      const d = data[i];
      ctx.lineTo(getPixelForDate(d.time), getPixelForPrice(d.value));
    }

    ctx.stroke();
    ctx.restore();
  }
  
  private _drawBackground(ctx: CanvasRenderingContext2D) {
    // Draw background
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
  }
}

export default CandleStickChartCore;
