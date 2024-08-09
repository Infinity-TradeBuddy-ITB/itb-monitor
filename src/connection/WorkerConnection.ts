import {io, type Socket} from 'socket.io-client';
import {type StockTicker, StockEventType, type YPriceData} from 'itb-types';

enum WorkerMessages {
  FLUCTUATION = 'fluctuation',
  CANDLE = 'candle',
  MOVING_AVERAGE = 'moving-average',
  OPERATION = 'operation',
}

class WorkerConnection {
  private readonly _io: Socket;

  constructor() {
    this._io = io('');
  }

  public subscribe(stockName: StockTicker) {
    this._io.send('ypriceEvent', {event: StockEventType.SUBSCRIBE, symbol: stockName});
  }

  public unsubscribe(stockName: StockTicker) {
    this._io.send('ypriceEvent', {event: StockEventType.UNSUBSCRIBE, symbol: stockName});
  }

  public onFluctation(fn: (fluctuation: YPriceData) => void) {
    this._io.on(WorkerMessages.FLUCTUATION, fn);
  }

  public onCandle(fn: (candle: YPriceData) => void) {
    this._io.on(WorkerMessages.CANDLE, fn);
  }

  public onMovingAverage(fn: (movingAverage: YPriceData) => void) {
    this._io.on(WorkerMessages.MOVING_AVERAGE, fn);
  }

  public onOperation(fn: (operation: YPriceData) => void) {
    this._io.on(WorkerMessages.OPERATION, fn);
  }
}

export default new WorkerConnection();
