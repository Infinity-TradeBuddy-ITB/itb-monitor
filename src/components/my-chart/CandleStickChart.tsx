
import React, {useEffect, useRef} from 'react';
import CandleStickChartCore from './CandleStickChartCore';
import {type Fluctuation} from './plots/utils/FluctuationUtils';

interface CandleStickChartProps {
  data: Fluctuation[];
  innerRef?: React.MutableRefObject<CandleStickChartCore | undefined>;
}

const CandleStickChart: React.FC<CandleStickChartProps> = props => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const core = useRef<CandleStickChartCore>();
  useEffect(() => {
    if (!canvasRef.current) return;
    core.current = new CandleStickChartCore(canvasRef.current, props.data);
    if (props.innerRef) {
      props.innerRef.current = core.current;
    }
    
    return core.current.destroy;
  }, []);
  return <canvas ref={canvasRef}></canvas>;
};

export default CandleStickChart;
