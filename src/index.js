import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import coinbaseWalletModule from '@web3-onboard/coinbase';
import injectedModule from '@web3-onboard/injected-wallets';
import ledgerModule from '@web3-onboard/ledger';
import { init, Web3OnboardProvider } from '@web3-onboard/react';
import { chainExplorerMap, chainMap, chainRpcMap, currencyMap } from "./config/constant";

const appMetadata = {
  name: 'Metopia',
  icon: 'https://oss.metopia.xyz/imgs/metopia-logo.svg',
  logo: 'https://oss.metopia.xyz/imgs/metopia-logo.svg',
  description: 'LOGIN',
  recommendedInjectedWallets: [
    { name: 'MetaMask', url: 'https://metamask.io' },
    { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
  ]
}

const injected = injectedModule()
const ledger = ledgerModule()
const coinbaseWalletSdk = coinbaseWalletModule({ darkMode: true })
const web3Onboard = init({
  wallets: [injected, coinbaseWalletSdk, ledger],
  chains: ['0x61'].map(chainId => {
    return {
      id: chainId,
      rpcUrl: chainRpcMap[chainId],
      label: chainMap[chainId],
      token: currencyMap[chainId],
      blockExplorerUrl: chainExplorerMap[chainId]
    }
  }),
  appMetadata
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Web3OnboardProvider web3Onboard={web3Onboard}>
      <App />
    </Web3OnboardProvider>
  </React.StrictMode>
);
