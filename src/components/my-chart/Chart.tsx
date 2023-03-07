
import React, {useEffect, useRef} from 'react';
import ChartCore from './ChartCore';
import {type Fluctuation} from './plots/utils/FluctuationUtils';

interface ChartProps {
  data: Fluctuation[];
  innerRef?: React.MutableRefObject<ChartCore | undefined>;
}

const Chart: React.FC<ChartProps> = props => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const core = useRef<ChartCore>();
  useEffect(() => {
    if (!canvasRef.current) return;
    core.current = new ChartCore(canvasRef.current, props.data);
    if (props.innerRef) {
      props.innerRef.current = core.current;
    }
    
    return core.current.destroy;
  }, []);
  return <canvas ref={canvasRef}></canvas>;
};

export default Chart;
