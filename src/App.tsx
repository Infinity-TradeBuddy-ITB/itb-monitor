import React, {useEffect, useRef} from 'react';
// .import CandleStickChart from './components/chartjs-chart/CandleStickChart';
import CandleStickChart from './components/my-chart/CandleStickChart';
import type CandleStickChartCore from './components/my-chart/CandleStickChartCore';
import fluctuations from './components/my-chart/mockdata';

const RealtimeFeeding: React.FC = () => {
  const chartRef = useRef<CandleStickChartCore>();

  useEffect(() => {
    if (!chartRef.current) return;
    let i = 0;
    const interval = setInterval(() => {
      // . console.log('push test:', i);
      chartRef.current?.push(fluctuations[i++]);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return <CandleStickChart innerRef={chartRef} data={[]} />;
};

const StaticFeeding: React.FC = () => <CandleStickChart data={fluctuations} />;

const App: React.FC = () => <RealtimeFeeding />;

export default App;
