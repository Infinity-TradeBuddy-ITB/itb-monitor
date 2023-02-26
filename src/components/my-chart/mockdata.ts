/* eslint-disable max-params */
/* eslint-disable no-bitwise */

import {type Fluctuation} from './CandleStickChart';

function mulberry32(a: number) {
  return () => {
    a += 0x6D2B79F5;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

interface SimulateStockPriceParams {
  bD: Date;
  S0: number;
  r: number;
  sigma: number;
  T: number;
  N: number;
  seed?: number;
  by?: 'day' | 'year';
}

/**
 * Simulates a stock price path using a geometric Brownian motion model.
 *
 * @param bD period initial date
 * @param S0 initial stock price
 * @param r expected annual return (risk-free rate)
 * @param sigma annual standard deviation (volatility)
 * @param T time horizon (in years by default)
 * @param N number of fluctuations
 * @param seed random seed (optional)
 * @param by the type of time horizon (years by default)
 * @returns an array of stock prices over time.
 */
function simulateStockPrice({bD, S0, r, sigma, T, N, seed = 12345, by = 'year'}: SimulateStockPriceParams): Fluctuation[] {
  const dtUnix = (() => {
    if (by === 'day') {
      return (new Date(bD.getTime()).setDate(bD.getDate() + T) - bD.getTime()) / N;
    }

    return (new Date(bD.getTime()).setFullYear(bD.getFullYear() + T) - bD.getTime()) / N;
  })();

  const f = T / N;
  const drift = (r - 0.5 * sigma ** 2) * f;
  const volatility = sigma * Math.sqrt(f);
  const prices = [{time: bD.getTime(), value: S0}];

  const rand = mulberry32(seed);

  for (let i = 1; i <= N; i++) {
    const Z = rand();
    const increment = (drift + volatility * Z);
    const price = prices[i - 1].value * Math.exp(increment);
    const time = bD.getTime() + i * dtUnix;
    prices.push({time, value: price});
  }

  return prices;
}

function simulateFluctuation(bD: Date, N: number) {
  const {cos, sin, log2} = Math;
  const prices: Array<{time: number; value: number}> = [];

  const base = bD.getTime();
  const dt = (new Date(base).setDate(bD.getDate() + 1) - base) / N;

  const fn = (x: number) => cos(x) + sin(x / 3) + 10 * log2(x) + 10 * cos(x / 13) + 1 + 30 * cos(x / 21);
  for (let i = 0; i < N; i++) {
    prices.push({time: base + dt * i, value: fn(i)});
  }

  return prices;
}

/* .
const fluctuations: Fluctuation[] = simulateStockPrice({
  bD: new Date('2022/01/01'), 
  S0: 100, 
  r: 0.05, 
  sigma: 0.01, 
  T: 1, 
  N: 86400, 
  by: 'day',
});
*/

const fluctuations: Fluctuation[] = simulateFluctuation(new Date('2022/01/01'), 86400);

export default fluctuations;
