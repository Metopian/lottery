import React from 'react'
import './App.scss';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Index, { CreatePage, JoinPage } from './page';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { init, Web3OnboardProvider } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import ledgerModule from '@web3-onboard/ledger'
import { chainExplorerMap, chainMap, chainRpcMap, currencyMap } from "./config/constant";
import coinbaseWalletModule from '@web3-onboard/coinbase'

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
  chains: ['0x1', '0x89', '0x38'].map(chainId => {
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

function App() {
  return (
    <div className="App">
      <Web3OnboardProvider web3Onboard={web3Onboard}>
        <BrowserRouter basename="">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/join" element={<JoinPage />} />
          </Routes>
        </BrowserRouter>

        <ToastContainer
          position="top-right"
          autoClose={8000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored" />
      </Web3OnboardProvider>
    </div>
  );
}

export default App;
