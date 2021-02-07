import React from 'react';
import ReactDOM from 'react-dom';
import { hydrate } from 'react-dom';
import './index.css';
import App from './App';
import { Auth0Provider } from "@auth0/auth0-react";

import reportWebVitals from './reportWebVitals';

const rootElement = document.getElementById("root");
const spa = <React.StrictMode>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootswatch/4.5.2/cosmo/bootstrap.min.css" crossOrigin="anonymous" />
  <Auth0Provider
    domain="wiregarden.us.auth0.com"
    clientId="x5p19wMCugp8MhiLxeTWcGCDSXYktS2h"
    redirectUri={window.location.origin}
    audience="https://wiregarden.io/api/v1"
    scope="openid profile email"
  >
    <App />
  </Auth0Provider>
</React.StrictMode>;

if (rootElement.hasChildNodes()) {
  hydrate(spa, rootElement);
} else {
  ReactDOM.render(spa, rootElement);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
