
import Chart from '@components/my-chart/Chart';
import type ChartCore from '@components/my-chart/ChartCore';
import fluctuations from '@components/my-chart/mockdata';
import {type StockTicker} from 'itb-types';
import React, {useEffect, useRef, useState} from 'react';

import {MdCandlestickChart, MdShowChart, MdMultilineChart} from 'react-icons/md';
import {GrLineChart} from 'react-icons/gr';

interface MonitorProps {
  stock: StockTicker;
}

const Monitor: React.FC<MonitorProps> = () => {
  const [line, setLine] = useState<boolean>(true);
  const [candle, setCandle] = useState<boolean>(true);
  const [movingAverage, setMovingAverage] = useState<boolean>(true);
  const [operation, setOperation] = useState<boolean>(true);

  const chartRef = useRef<ChartCore>();

  useEffect(() => {
    if (!chartRef.current) return;
    let i = 0;
    const interval = setInterval(() => {
      // . console.log('push test:', i);
      chartRef.current?.push(fluctuations[i++]);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='monitor'>
      <Chart 
        innerRef={chartRef} 
        data={[]} 
        activeLinePlot={line}
        activeCandlePlot={candle}
        activeMovingAveragePlot={movingAverage}
      />
      <div className='configs'>
        <button 
          className={line ? 'active' : ''} 
          onClick={() => setLine(v => !v)} 
          title='Fluctuations'
        >
          <MdShowChart />
        </button>
        <button 
          className={candle ? 'active' : ''} 
          onClick={() => setCandle(v => !v)} 
          title='Candlestick Fluctuations'
        >
          <MdCandlestickChart />
        </button>
        <button 
          className={movingAverage ? 'active' : ''} 
          onClick={() => setMovingAverage(v => !v)} 
          title='Moving Average'
        >
          <MdMultilineChart />
        </button>
        <button 
          className={operation ? 'active' : ''} 
          onClick={() => setOperation(v => !v)}
          title='Buy/Sell Operations'
        >
          <GrLineChart />
        </button>
      </div>
    </div>
  );
};

export default Monitor;
