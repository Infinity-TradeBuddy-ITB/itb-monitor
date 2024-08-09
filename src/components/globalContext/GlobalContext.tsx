import React, {useState} from 'react';

const GlobalContext_ = React.createContext<Partial<{
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
}>>({});

interface GlobalContextProps {
  children: React.ReactNode;
}

const GlobalContext: React.FC<GlobalContextProps> = props => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  return (
    <GlobalContext_.Provider value={{openModal, setOpenModal}}>
      {props.children}
    </GlobalContext_.Provider>
  );
};

export default GlobalContext;
