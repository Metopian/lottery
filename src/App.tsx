import React from 'react'
import './App.scss';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Index, { CreatePage, JoinPage } from './page';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="App">
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
    </div>
  );
}

export default App;
