import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { requestedScopes } from './constants';
import { AuthTokenProvider } from './AuthTokenContext';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/pages/Home.tsx';
import Phones from './components/pages/Phones.tsx';
import Speakers from './components/pages/Speakers.tsx';
import Profile from './components/pages/Profile.tsx';
import VerifyUser from './components/pages/VerifyUser.tsx';
import Cart from './components/pages/Cart.tsx';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN!}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/verify-user`,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: requestedScopes.join(" "),
      }}
    >
      <AuthTokenProvider>
        <ToastContainer position='top-center' />
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/phones' element={<Phones />} />
            <Route path='/speakers' element={<Speakers />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/verify-user' element={<VerifyUser />} />
          </Routes>
        </BrowserRouter>
      </AuthTokenProvider>
    </Auth0Provider>
  </React.StrictMode>
);
