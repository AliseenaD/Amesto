import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthTokenProvider } from './AuthTokenContext';
import { CartProvider } from './CartContext.js';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/pages/Home.tsx';
import Phones from './components/pages/Phones.tsx';
import Speakers from './components/pages/Speakers.tsx';
import Profile from './components/pages/Profile.tsx';
import Cart from './components/pages/Cart.tsx';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import News from './components/pages/News.tsx';
import Headphones from './components/pages/Headphones.tsx';
import Accessories from './components/pages/Accessories.tsx';
import Watches from './components/pages/Watches.tsx';
import Register from './components/pages/Register.tsx';
import NavBar from './components/elements/NavBar.tsx';

const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
      <BrowserRouter>
          <AuthTokenProvider>
            <CartProvider>
              <ToastContainer position='top-center' />
                <NavBar />
                <Routes>
                  <Route path='/' element={<Home />} />
                  <Route path='/phones' element={<Phones />} />
                  <Route path='/speakers' element={<Speakers />} />
                  <Route path='/news' element={<News />} />
                  <Route path='/headphones' element={<Headphones />} />
                  <Route path='/accessories' element={<Accessories />} />
                  <Route path='watches' element={<Watches />} />
                  <Route path='/cart' element={<Cart />} />
                  <Route path='/profile' element={<Profile />} />
                  <Route path='/register' element={<Register />} />
                </Routes>
            </CartProvider>
          </AuthTokenProvider>
      </BrowserRouter>
  </React.StrictMode>
);
