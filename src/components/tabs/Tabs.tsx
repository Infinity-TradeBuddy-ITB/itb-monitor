import React, {useCallback, useMemo, useState} from 'react';
import {MdAdd} from 'react-icons/md';

interface TabProps {
  name: string;
  tab: number;
  active: boolean;
  setTab: (tab: number) => void;
}

const Tab: React.FC<TabProps> = props => {
  const {tab, active, setTab} = props;
  const handleClick = useCallback(() => {
    setTab(tab);
  }, [tab, setTab]);
  return <button 
    className={`${active ? 'active' : ''}`} 
    type='button' 
    onClick={handleClick}
  > 
    {props.name} 
  </button>;
};

interface TabsProps {
  tabs: Array<{name: string; tab: React.ReactNode}>;
}

const Tabs: React.FC<TabsProps> = props => {
  const [tab, setTab] = useState<number>(0);

  const activeTab = useMemo(() => props.tabs[tab].tab, [tab]);

  return (
    <div className='tabs'>
      <div className='buttons'>
        <div className='inner'>
          {props.tabs.map((tabButton, i) => <Tab key={tabButton.name} name={tabButton.name} setTab={setTab} tab={i} active={tab === i} />)}
        </div>
        <button type='button'> <MdAdd /> </button>
      </div>
      <div className='screen'>
        {activeTab}
      </div>
    </div>
  );
};

export default Tabs;
