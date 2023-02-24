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

/**
 * Simulates a stock price path using a geometric Brownian motion model.
 *
 * @param bD period initial date
 * @param S0 initial stock price
 * @param r expected annual return (risk-free rate)
 * @param sigma annual standard deviation (volatility)
 * @param T time horizon (in years)
 * @param seed random seed (optional)
 * @returns an array of stock prices over time.
 */
function simulateStockPrice(
  bD: Date,
  S0: number,
  r: number,
  sigma: number,
  T: number,
  N: number,
  seed = 12345,
): Fluctuation[] {
  const dtUnix = (new Date(bD.getTime()).setFullYear(bD.getFullYear() + T) - bD.getTime()) / N;
  const dt = T / N;
  const drift = (r - 0.5 * sigma ** 2) * dt;
  const volatility = sigma * Math.sqrt(dt);
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

const fluctuations: Fluctuation[] = simulateStockPrice(new Date('2022/01/01'), 100, 0.05, 0.2, 1, 252, 12345);

export default fluctuations;
