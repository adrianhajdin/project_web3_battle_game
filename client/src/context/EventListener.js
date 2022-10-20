import { ethers } from 'ethers';

import { ABI } from '../contract';

const iface = new ethers.utils.Interface(ABI);

export function AddNewEvent(eventFilter, provider, cb) {
  provider.removeListener(eventFilter);
  provider.on(eventFilter, (logs) => {
    const parsedLog = iface.parseLog(logs);
    cb(parsedLog);
  });
}
