import React, {useEffect, useRef} from 'react';
// .import CandleStickChart from './components/chartjs-chart/CandleStickChart';
import Chart from './components/my-chart/Chart';
import type ChartCore from './components/my-chart/ChartCore';
import fluctuations from './components/my-chart/mockdata';

const RealtimeFeeding: React.FC = () => {
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

  return <Chart innerRef={chartRef} data={[]} />;
};

const StaticFeeding: React.FC = () => <Chart data={fluctuations} />;

const App: React.FC = () => <RealtimeFeeding />;

export default App;
