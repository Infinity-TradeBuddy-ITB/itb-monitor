import React, {useCallback, useMemo, useState} from 'react';
import {MdAdd, MdClose} from 'react-icons/md';

import {useModal} from 'aquino';
import StockModal from '@components/stockModal/StockModal';
import {type StockTicker} from 'itb-types';
import useUpdater from '@hooks/useUpdater';
import Monitor from '@components/monitor/Monitor';

const subscribedStocks = new Set<StockTicker>();

interface TabProps {
  stock: StockTicker;
  active: boolean;
  setTab: (tab: StockTicker) => void;
  unsubscribe: (tab: StockTicker) => void;
}

const Tab: React.FC<TabProps> = props => {
  const {stock, active, setTab, unsubscribe} = props;
  const handleClick = useCallback(() => {
    setTab(stock);
  }, [stock, setTab]);
  const handleClose = useCallback(() => {
    unsubscribe(stock);
  }, [stock, unsubscribe]);
  return (
    <div 
      className={`${active ? 'active' : ''}`} 
      role='button' 
      onClick={handleClick}
    > 
      {stock}
      <button type='button' onClick={handleClose}> <MdClose /> </button> 
    </div>
  );
};

const Tabs: React.FC<JSX.IntrinsicAttributes> = props => {
  const [tab, setTab] = useState<StockTicker | null>(null);
  const [updater, update] = useUpdater();
  const {open} = useModal('stocks');

  const subscribe = useCallback((stock: StockTicker) => {
    subscribedStocks.add(stock);
    update();
    if (!tab) setTab(stock);
  }, [tab]);

  const unsubscribe = useCallback((stock: StockTicker) => {
    subscribedStocks.delete(stock);
    update();
    if (tab === stock) setTab(subscribedStocks.values().next().value ?? null);
  }, [tab]);

  const stockArray = [...subscribedStocks];

  return (
    <div className='tabs'>
      <div className='buttons'>
        <div className='inner'>
          {stockArray.map(s => <Tab key={s} stock={s} active={tab === s} setTab={setTab} unsubscribe={unsubscribe} />)}
        </div>
        <button type='button' onClick={open}> <MdAdd /> </button>
      </div>
      <div className='screen'>
        {stockArray.map(s => (
          <div key={s} className={`${s === tab ? 'active' : ''}`}>
            <Monitor stock={s} />
          </div>
        ))}
      </div>
      <StockModal subscribe={subscribe} />
    </div>
  );
};

export default Tabs;
