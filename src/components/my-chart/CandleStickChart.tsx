
import React, {useEffect, useRef} from 'react';

/* .
export interface DataType {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}
*/

export interface Fluctuation {
  time: number;
  value: number;
}

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
    return (this.max - this.clipWidth) + this.clipRight;
  }

  public get clipMax() {
    return this.max + this.clipRight;
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
      x: 64,
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

    this._constraints.x.interval = 0.17;
    this._setupZoom();
    this._setupGrabbing();
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
    ctx.fillStyle = 'rgba(63, 63, 63, 1)';
    // Draw x axis
    ctx.beginPath();
    ctx.moveTo(x.x1, x.y1);
    ctx.lineTo(x.x2, x.y2);
    ctx.stroke();
    // Draw y axis
    ctx.beginPath();
    ctx.moveTo(y.x1, y.y1);
    ctx.lineTo(y.x2, y.y2);
    ctx.stroke();
  }

  public drawMeasures(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'rgba(63, 63, 63, 1)';

    this._drawXMeasures(ctx);
    this._drawYMeasures(ctx);
  }

  private _drawXMeasures(ctx: CanvasRenderingContext2D) {
    const {margin} = this._core.getConstraints();
    const {x, size} = this._constraints;

    const xPositionUnit = x.dx * x.interval;
    const xValueUnit = x.dt * x.interval;

    for (
      let xPosition = xPositionUnit, xValue = xValueUnit; 
      xPosition < x.dx; 
      xPosition += xPositionUnit,
      xValue += xValueUnit
    ) {
      this._drawXMark(ctx, margin + size.x + xPosition, x.clipBase + xValue);
    }
  }

  private _drawYMeasures(ctx: CanvasRenderingContext2D) {
    const {fromBottom} = this._core;
    const {margin} = this._core.getConstraints();
    const {y, size} = this._constraints;

    const amount = this._calculateAmountRange();
    const yPositionUnit = y.dy * y.interval;
    const yValueUnit = amount * y.interval;

    for (
      let yPosition = yPositionUnit, yValue = yValueUnit; 
      yPosition < y.dy; 
      yPosition += yPositionUnit,
      yValue += yValueUnit
    ) {
      this._drawYMark(ctx, fromBottom(margin + size.y + yPosition), yValue);
    }
  }

  private _drawXMark(ctx: CanvasRenderingContext2D, x: number, v: number) {
    const {fromBottom} = this._core;
    const {x: xAxis} = this._constraints;
    ctx.beginPath();
    ctx.moveTo(x, xAxis.y1);
    ctx.lineTo(x, xAxis.y1 + 8);
    ctx.stroke();
    ctx.fillText(new Date(v).toLocaleString(xAxis.locale.locale, xAxis.locale.config), x, fromBottom(8));
  }

  private _drawYMark(ctx: CanvasRenderingContext2D, y: number, v: number) {
    const {y: yAxis} = this._constraints;
    ctx.beginPath();
    ctx.moveTo(yAxis.x1, y);
    ctx.lineTo(yAxis.x1 - 8, y);
    ctx.stroke();
    ctx.fillText(String(v.toFixed(2)), 8, y);
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

  private _setupZoom() {
    this._core.getCanvas().addEventListener('wheel', e => {
      const delta = e.deltaY || ((e as unknown as any).wheelDeltaX as number);
      this._constraints.x.zoom += delta / 10000;
      this._core.updateTimeClip();
      this._core.render();
    });
  }

  private _setupGrabbing() {
    this._core.getCanvas().addEventListener('mousedown', () => {
      this._constraints.grabbing = true;
      this._core.getCanvas().style.cursor = 'grabbing';
    });
    window.addEventListener('mouseup', () => {
      this._constraints.grabbing = false;
      this._core.getCanvas().style.cursor = 'default';
    });
    window.addEventListener('mousemove', e => {
      if (this._constraints.grabbing) {
        const {x} = this._constraints;
        x.clipRight -= e.movementX * 100;
        this._core.updateTimeClip();
        this._core.render();
      }
    });
  }

  // .private _scaleY(y: number) {
  //   const {y: yAxis} = this._constraints;
  //   return (y*100) / Math.abs(yAxis.y2 - yAxis.y1);
  // }
}

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
  };

  constructor(canvas: HTMLCanvasElement, data: Fluctuation[]) {
    this._canvas = canvas;
    this._data = data;

    this.fromBottom = this.fromBottom.bind(this);
    this.fromRight = this.fromRight.bind(this);
    this.updateTimeClip = this.updateTimeClip.bind(this);
    this.render = this.render.bind(this);

    this._scales = new Scales(this);
    this.updateTimeClip();

    canvas.width = window.innerWidth - 16;
    canvas.height = window.innerHeight - 16;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not initialized!');
    this._ctx = ctx;
    // .requestAnimationFrame(() => this._loop(ctx));
    this.render();
  }

  public push(data: Fluctuation) {
    this._data.push(data);
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

  public render() {
    const ctx = this._ctx;
    this._drawBackground(ctx);
    this._scales.drawAxies(ctx);
    this._scales.drawMeasures(ctx);
    this._plot(ctx);
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

interface CandleStickChartProps {
  data: Fluctuation[];
  innerRef?: React.MutableRefObject<CandleStickChartCore>;
}

const CandleStickChart: React.FC<CandleStickChartProps> = props => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const core = useRef<CandleStickChartCore>();
  useEffect(() => {
    if (!canvasRef.current) return;
    core.current = new CandleStickChartCore(canvasRef.current, props.data);
    if (!props.innerRef) return;
    props.innerRef.current = core.current;
  }, []);
  return <canvas ref={canvasRef}></canvas>;
};

export default CandleStickChart;
