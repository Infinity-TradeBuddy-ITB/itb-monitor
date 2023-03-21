import {useState} from 'react';

function useUpdater(): [boolean, () => void] {
  const [updater, update] = useState<boolean>(false);
  return [updater, () => update(u => !u)];
}

export default useUpdater;
