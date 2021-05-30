import React, { useState, useEffect, useReducer } from 'react';
import SecureLS from 'secure-ls';
import { Link, BrowserRouter, Route } from 'react-router-dom';

import Login from './Pages/Login';
import LoadEvents from './Pages/LoadEvents';

import Call from './Pages/Call';
import StandInfo from './Pages/LoadStand';
import Chat from './Pages/Chat';
import UserContext from './UserContext';
import { reducer, initialState } from './reducers/authReducer';
import properties from './properties';
import authentication from 'react-azure-b2c';
import axios from 'axios';
import CloseIcon from '@material-ui/icons/Close';

var ls = new SecureLS({ encodingType: 'aes' });
var globalVisitors = [];

function setCookie(cname, cvalue, exdays) {
  //console.log('Setcookie&&&&&&&&&&&&');
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [user, setUser] = useState('');
  const token = authentication.getAccessToken();
  setCookie('eveStgMgmt_UserTkn', token.accessToken, 1);
  axios.defaults.headers.common['authorization'] =
    'Bearer ' + token.accessToken;

  useEffect(() => {
    getUser();
  }, []);

  function getUser() {
    console.log('fire');
    axios
      .get(`${properties.BASE_URL}/api/exhibitors/details`)
      .then(res => {
        console.log('user', user);
        ls.set('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
      })
      .catch(err => console.log('err', err));
  }

  return (
    <UserContext.Provider value={{ user }}>
      <BrowserRouter basename={properties.APP_PATH}>
        <div className="root">
          {/* <Route path="/" component={Main} /> */}

          {/* <Route exact path="/">
            <Login />
          </Route> */}

          {/* <Route exact path="/login">
            <Login />
          </Route> */}

          <Route exact path="/">
            <LoadEvents />
          </Route>

          <Route exact path="/loadEvents">
            <LoadEvents />
          </Route>

          <Route
            exact
            path="/chat/:dpname_enc/:dporg_enc/:pbnbKeys_enc/:agora_key_enc/:eventid_param/:channel_enc/:speaker_data_enc"
          >
            <Chat />
          </Route>

          {/* <Route path="/video/:dpname_enc/:receivername/:agora_appid_enc/:agora_token/:agora_channel/:uuid_enc/:starttime"> */}
          <Route exact path="/video/:senderChannel_enc/:start_ts/:callerid_enc">
            <Call />
          </Route>
          <Route
            exact
            path="/standLoad/:dpname_enc/:dporg_enc/:pbnbKeys_enc/:agora_key_enc/:eventid_param/:channel_enc/:speaker_data_enc"
          >
            <StandInfo />
          </Route>
        </div>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
