import React, {useEffect, useRef} from 'react';
import GlobalContext from '@components/globalContext/GlobalContext';
import Chart from '@components/my-chart/Chart';
import type ChartCore from '@components/my-chart/ChartCore';
import fluctuations from '@components/my-chart/mockdata';
import Tabs from '@components/tabs/Tabs';

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

const App: React.FC = () => (
  <GlobalContext>
    <Tabs 
      tabs={[
        {name: 'a', tab: <> something a</>},
        {name: 'b', tab: <> something b</>},
        {name: 'c', tab: <> something c</>},
        {name: 'd', tab: <> something d</>},
      ]}
    />
  </GlobalContext>
);

export default App;
