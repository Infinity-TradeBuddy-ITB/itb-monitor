import React, {useEffect, useRef} from 'react';
import GlobalContext from '@components/globalContext/GlobalContext';
import Chart from '@components/my-chart/Chart';
import type ChartCore from '@components/my-chart/ChartCore';
import fluctuations from '@components/my-chart/mockdata';
import Tabs from '@components/tabs/Tabs';

import Aquino from 'aquino';

const App: React.FC = () => (
  <Aquino>
    <Tabs />
  </Aquino>
);

export default App;
