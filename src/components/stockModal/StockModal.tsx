import React, {useCallback} from 'react';
import {useModal, Modal, Box, Button, ComboBox, ScrollContainer, BoxProps} from 'aquino';
import {MdClose} from 'react-icons/md';
import {StockTicker} from 'itb-types';

const stocks = [
  StockTicker.ABEV3_SA,
  StockTicker.ALPA4_SA,
  StockTicker.AMER3_SA,
  StockTicker.ARZZ3_SA,
  StockTicker.ASAI3_SA,
  StockTicker.AZUL4_SA,
  StockTicker.B3SA3_SA,
  StockTicker.BBAS3_SA,
  StockTicker.BBDC3_SA,
  StockTicker.BBDC4_SA,
  StockTicker.BBSE3_SA,
];

interface StockModalProps {
  subscribe: (stock: StockTicker) => void;
}

const StockModal: React.FC<StockModalProps> = props => {
  const {close} = useModal('stocks');

  const handleSubscribe = useCallback((stock: StockTicker) => {
    props.subscribe(stock);
    close();
  }, []);

  return (
    <Modal id='stocks' className='stock-modal'>
      <Box>
        <div className='header'>
          <Button onAction={close}>
            <MdClose />
          </Button>
        </div>
        <div className='body'>
          <ScrollContainer maxHeight={window.innerHeight * 0.7}>
            {stocks.map(s => (
              <Box key={s} onClick={() => handleSubscribe(s)}>
                {s}
              </Box>
            ))}
          </ScrollContainer>
        </div>
      </Box>
    </Modal>
  );
};

export default StockModal;
