import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './App.css';
import './global.css';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import App from './App';
import reportWebVitals from './reportWebVitals';
import UserContext from './UserContext';
import authentication from 'react-azure-b2c';
import ErrorBoundary from './ErroBoundary';

authentication.initialize({
  instance: process.env.REACT_APP_LOGIN_INSTANCE,
  tenant: process.env.REACT_APP_TENANT,
  signInPolicy: 'B2C_1_evesignup',
  clientId: process.env.REACT_APP_CLIENTID,
  cacheLocation: 'sessionStorage',
  scopes: [process.env.REACT_APP_SCOPES],
  redirectUri: process.env.REACT_APP_HOME_URL,
  postLogoutRedirectUri: window.location.origin,
});

authentication.run(() => {
  ReactDOM.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
    document.getElementById('root')
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
