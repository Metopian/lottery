import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.scss';
import Index from './page/Index';

import { Menu } from './component/Menu';
import { useConnectWallet } from '@web3-onboard/react';
import CreateRafflePage from './page/create';
import JoinPage from './page/join';

function App() {

  const [{ wallet }, connect] = useConnectWallet()
  useEffect(() => {
    let disconnected = localStorage.getItem('disconnect')
    if (!wallet && disconnected !== 'true') {
      connect({ autoSelect: { label: 'MetaMask', disableModals: true } })
    }
    if (wallet && disconnected === 'true') {
      localStorage.setItem("disconnect", 'false')
    }
  }, [wallet, connect])

  useEffect(() => {
    const int = setInterval(() => {
      let ele = (document.getElementsByTagName("onboard-v2")[0] as HTMLElement)
      let sr = ele.shadowRoot
      let toaster = sr?.getElementById("account-center-with-notify") as HTMLElement
      if (toaster && toaster.style.display !== 'none') {
        toaster.style.display = 'none'
        clearInterval(int)
      }
    }, 100);
  }, [])

  return (
    <div className="App">
      <BrowserRouter basename="">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create" element={<CreateRafflePage />} />
          <Route path="/app" element={<JoinPage />} />
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

      <div className="menu-container">
        <div className="wrapper">
          <Menu active={-1} />
        </div>
      </div>
    </div>
  );
}

export default App;
