
import React, {useEffect, useRef} from 'react';
import ChartCore from './ChartCore';
import {type Fluctuation} from './plots/utils/FluctuationUtils';

interface ChartProps {
  data: Fluctuation[];
  activeLinePlot: boolean;
  activeCandlePlot: boolean;
  activeMovingAveragePlot: boolean;
  innerRef?: React.MutableRefObject<ChartCore | undefined>;
}

const Chart: React.FC<ChartProps> = props => {
  const {data, innerRef, activeLinePlot, activeCandlePlot, activeMovingAveragePlot} = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const core = useRef<ChartCore>();

  useEffect(() => {
    if (!canvasRef.current) return;
    core.current = new ChartCore(
      canvasRef.current, 
      data,
      activeLinePlot,
      activeCandlePlot,
      activeMovingAveragePlot,
    );
    if (innerRef) {
      innerRef.current = core.current;
    }
    
    return core.current.destroy;
  }, []);

  useEffect(() => {
    if (!core.current) return;
    core.current.getLinePlot().setActive(activeLinePlot);
    core.current.getCandlePlot().setActive(activeCandlePlot);
    core.current.getMovingAveragePlot().setActive(activeMovingAveragePlot);
  }, [activeLinePlot, activeCandlePlot, activeMovingAveragePlot]);

  return <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight - 32}></canvas>;
};

export default Chart;
