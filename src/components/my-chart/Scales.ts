import type CandleStickChartCore from './CandleStickChartCore';

class Axis {
  public x1 = 0;
  public y1 = 0;
  public x2 = 0;
  public y2 = 0;
  public interval = 0.1;
}

class TimeAxis extends Axis {
  public max = 0;
  public min = 0;
  public period = 60000;
  public zoom = 0;
  public clipRight = 0;
  public locale = {
    locale: 'en',
    config: Object.freeze({
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }),
  };

  public get dx() {
    return Math.abs(this.x1 - this.x2);
  }

  public get dt() {
    return this.max - this.base;
  }

  public get base() {
    return this.max - 60000;
  }

  public get clipWidth() {
    return this.dt * (1 + this.zoom);
  }

  public get clipBase() {
    return (this.max - this.clipWidth) + this.clipRight * (1 + this.zoom);
  }

  public get clipMax() {
    return this.max + this.clipRight * (1 + this.zoom);
  }
}

class PriceAxis extends Axis {
  public higher = 0;

  public get dy() {
    return Math.abs(this.y1 - this.y2);
  }
}

class Scales {
  private readonly _constraints = {
    size: {
      x: 0,
      y: 32,
    },
    x: new TimeAxis(),
    y: new PriceAxis(),
    grabbing: false,
  };

  private readonly _core: CandleStickChartCore;

  constructor(core: CandleStickChartCore) {
    this._core = core;
    this.update();
    this.getPixelForPrice = this.getPixelForPrice.bind(this);
    this.getPixelForDate = this.getPixelForDate.bind(this);
    this.getConstraints = this.getConstraints.bind(this);
    this._onZoom = this._onZoom.bind(this);
    this._onGrab = this._onGrab.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onRelease = this._onRelease.bind(this);

    this._constraints.x.interval = 0.17;

    this._core.getCanvas().addEventListener('wheel', this._onZoom);
    
    this._core.getCanvas().addEventListener('mousedown', this._onGrab);
    window.addEventListener('mousemove', this._onMove);
    window.addEventListener('mouseup', this._onRelease);
  }

  public destroy() {
    this._core.getCanvas().removeEventListener('wheel', this._onZoom);
    this._core.getCanvas().removeEventListener('mousedown', this._onGrab);
    window.removeEventListener('mousemove', this._onMove);
    window.removeEventListener('mouseup', this._onRelease);
  }

  public getConstraints() {
    return this._constraints;
  }

  public update() {
    const {fromRight, fromBottom} = this._core;
    const {margin} = this._core.getConstraints();
    const {x, y, size} = this._constraints;

    x.x1 = margin + size.x;
    x.x2 = fromRight(margin);
    x.y1 = fromBottom(margin + size.y);
    x.y2 = x.y1;

    y.x1 = margin + size.x;
    y.x2 = y.x1;
    y.y1 = fromBottom(margin + size.y);
    y.y2 = margin;

    this._findHigherValues();
  }

  public getPixelForPrice(price: number): number {
    const {y, size} = this._constraints;
    const {margin} = this._core.getConstraints();
    const amount = this._calculateAmountRange();
    return this._core.fromBottom(margin + size.y + (price * y.dy) / amount);
  }

  public getPixelForDate(date: number): number {
    const {fromRight} = this._core;
    const {x} = this._constraints;
    const {margin} = this._core.getConstraints();
    return fromRight(margin + (((x.clipMax - date) * x.dx) / x.clipWidth));
  }

  public drawAxies(ctx: CanvasRenderingContext2D) {
    const {x, y} = this._constraints;
    ctx.strokeStyle = 'rgba(61, 93, 186, 1)';
    // Draw x axis
    ctx.beginPath();
    ctx.moveTo(x.x1, x.y1);
    ctx.lineTo(x.x2, x.y2);
    ctx.stroke();
  }

  public drawXMeasures(ctx: CanvasRenderingContext2D) {
    const {margin} = this._core.getConstraints();
    const {x, y, size} = this._constraints;

    const begin = this._getPeriodInTime(x.clipBase);
    const end = this._getPeriodInTime(x.clipMax);

    ctx.save();
    ctx.rect(x.x1, y.y2, x.x2 - x.x1, margin + size.y + y.y1 - y.y2);
    ctx.clip();

    ctx.setLineDash([5, 3]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(133, 177, 255, 0.15)';
    ctx.fillStyle = 'rgba(61, 93, 186, 1)';
    ctx.textAlign = 'center';

    for (let t = begin; t <= end; t += x.period) {
      this._drawXMark(ctx, t);
    }

    ctx.restore();
  }

  public drawYMeasures(ctx: CanvasRenderingContext2D) {
    const {fromBottom} = this._core;
    const {margin} = this._core.getConstraints();
    const {y, size} = this._constraints;

    const amount = this._calculateAmountRange();
    const yPositionUnit = y.dy * y.interval;
    const yValueUnit = amount * y.interval;

    ctx.save();

    ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillStyle = 'rgba(61, 93, 186, 1)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (
      let yPosition = yPositionUnit, yValue = yValueUnit; 
      yPosition < y.dy; 
      yPosition += yPositionUnit,
      yValue += yValueUnit
    ) {
      this._drawYMark(ctx, fromBottom(margin + size.y + yPosition), yValue);
    }

    ctx.restore();
  }

  private _drawXMark(ctx: CanvasRenderingContext2D, v: number) {
    const {fromBottom} = this._core;
    const {margin} = this._core.getConstraints();
    const {x, y} = this._constraints;
    const p = this.getPixelForDate(v);
    const markX = this.getPixelForDate(v + x.period / 2);
    const text = new Date(v).toLocaleString(x.locale.locale, x.locale.config);
    ctx.beginPath();
    ctx.moveTo(markX, y.y2);
    ctx.lineTo(markX, fromBottom(margin));
    ctx.stroke();
    ctx.fillText(text, p, x.y1 + 32);
  }

  private _drawYMark(ctx: CanvasRenderingContext2D, y: number, v: number) {
    const {fromRight} = this._core;
    const {margin} = this._core.getConstraints();

    ctx.fillText(v.toFixed(4), fromRight(margin * 2), y);
  }

  private _findHigherValues() {
    const data = this._core.getData();
    const {x, y} = this._constraints;
    data.forEach(d => {
      if (y.higher >= d.value) return;
      y.higher = d.value;
    });
    x.max = data[data.length - 1]?.time ?? 0;
    x.min = data[0]?.time ?? 0;
  }

  private _calculateAmountRange() {
    const {y} = this._constraints;
    const amount = y.higher || 2200;
    return amount + amount * y.interval * 2;
  }

  private _getBeginTime(period = this._constraints.x.period) {
    const {min} = this._constraints.x;
    const fix = min % period;
    return min - period + fix;
  }

  private _periodCount(t: number, period = this._constraints.x.period) {
    return Math.floor((t - this._getBeginTime(period)) / period);
  }

  private _getPeriodInTime(t: number, period = this._constraints.x.period) {
    return this._getBeginTime(period) + this._periodCount(t, period) * period;
  }

  private _onZoom(e: WheelEvent) {
    const {shouldUpdate} = this._core.getConstraints();
    if (shouldUpdate) return;
    const delta = e.deltaY || ((e as unknown as any).wheelDeltaX as number);
    this._constraints.x.zoom += delta / 1000;
    this._core.getConstraints().shouldUpdate = true;
  }

  private _onGrab() {
    this._constraints.grabbing = true;
    this._core.getCanvas().style.cursor = 'grabbing';
  }

  private _onMove(e: MouseEvent) {
    const {shouldUpdate} = this._core.getConstraints();
    if (!this._constraints.grabbing || shouldUpdate) return;
    const {x} = this._constraints;
    x.clipRight -= e.movementX * 100;
    this._core.getConstraints().shouldUpdate = true;
  }

  private _onRelease() {
    this._constraints.grabbing = false;
    this._core.getCanvas().style.cursor = 'default';
  }
}

export default Scales;
