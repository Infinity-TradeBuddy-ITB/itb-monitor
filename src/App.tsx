import React from 'react';
// .import CandleStickChart from './components/chartjs-chart/CandleStickChart';
import CandleStickChart from './components/my-chart/CandleStickChart';
import fluctuations from './components/my-chart/mockdata';

const App: React.FC = () => <CandleStickChart data={fluctuations} />;

export default App;
