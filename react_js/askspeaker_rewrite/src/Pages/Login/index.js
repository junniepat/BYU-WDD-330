import React, { useState, useEffect, useContext } from 'react';
import { Link, BrowserRouter, Route } from 'react-router-dom';
import EveLogo_V4 from '../../images/EveLogo_V4.png';
import BG from '../../images/BG.jpg';
import { Button, Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { CommonLoading } from 'react-loadingg';
import UserContext from '../../UserContext';
import Logic from '../../utils/Logic';
import { loginBtn_event } from '../../components/styles';

export function setCookie(cname, cvalue, exdays) {
  //console.log('Setcookie&&&&&&&&&&&&');
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function Login() {
  const { dispatch } = useContext(UserContext);
  const [user, setUser] = useState('');
  const [notify, setNotification] = useState({});
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const Loggeduser = useContext(UserContext);
  console.log('user', Loggeduser);

  const handleLogin = () => {
    // Logic.validateCredentials(email, password).then(function(response) {
    //   setUser(response.user);
    //   var eveToken = response.token;
    //   setCookie('eveStgMgmt_Username', email, 1);
    //   setCookie('eveStgMgmt_UserTkn', eveToken, 1);
    //   setCookie('eveStgMgmt_loginstatus', 'loggedin', 1);
    //   if (typeof eveToken === 'undefined' || eveToken == null) {
    //     setNotification({
    //       msg: 'Incorrect Username/Password',
    //       severity: 'error',
    //     });
    //     setOpen(true);
    //     setLoading(true);
    //   } else {
    //     dispatch({
    //       type: 'LOGIN',
    //       payload: response,
    //     });
    //     console.log(response);
    //     window.location.replace('/loadEvents');
    //     setLoading(false);
    //   }
    // });
  };

  return (
    <div id="Loginpage" style={loginpage}>
      <img src={BG} alt="BG" style={bgimage} />

      <div style={loginHeader1}>
        <img
          src={EveLogo_V4}
          alt="logo"
          style={{ height: '150px', width: '155px' }}
        />
      </div>

      <div id="loginbox" style={loginbox}>
        <div id="loginHeader2" style={loginHeader2}>
          {' '}
          CHATBOARD
        </div>

        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Alert onClose={handleClose} severity={notify.severity}>
            {notify.msg}
          </Alert>
        </Snackbar>

        <div className="form-field">
          <input
            className="form-input"
            placeholder="Email Address"
            onKeyPress={e => {
              if (e.key !== 'Enter') return;
              handleLogin();
            }}
            required={true}
            type="text"
            id="frmNameTxt"
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="form-field">
          <input
            className="form-input"
            id="frmPasswordTxt"
            placeholder="Password"
            onKeyPress={e => {
              if (e.key !== 'Enter') return;
              handleLogin();
            }}
            type="password"
            required={true}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <Button
          variant="text"
          //style={loginBtn_event}
          className="form-btn"
          color="primary"
          onClick={handleLogin}
        >
          Login
        </Button>
      </div>

      {loading && (
        <div id="loading">
          <CommonLoading color="lightgrey" />
        </div>
      )}
    </div>
  );
}

const bgimage = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  opacity: 0.8,
};

const loginpage = {
  // background: 'linear-gradient(rgb(142, 45, 226) 0%, rgb(74, 0, 224) 100%)',
  alignItems: 'center',
  textAlign: 'center',
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: 'black',
  height: '100%',
  width: '100%',
  position: 'absolute',
  //background : "url(" + "https://image.winudf.com/v2/image1/Y29tLmVudG91cmFnZS5ldmVfc2NyZWVuXzRfMTU5NTAxNjU4NV8wMjE/screen-5.jpg?fakeurl=1&type=.jpg" + ")",

  //opacity: 0,
  // height: '100%',
  // width: '100%'
};

const loginHeader1 = {
  top: '2%',
  height: '25%',
  width: '100%',
  margin: '10px auto',
  position: 'absolute',
  color: 'white',
};

const loginHeader2 = {
  //top: '10%',
  // height: '25%',
  marginTop: '20px',
  marginBottom: '60px',
  width: '100%',
  top: '3%',
  color: '#D0B00F',
  fontSize: '30px',
  position: 'relative',
  fontWeight: 'bolder',
  fontFamily: 'Comfortaa',
};

const loginbox = {
  // display: 'flex',
  // alignItems: 'center',
  // flexDirection: 'column',
  position: 'relative',
  border: '1px solid lightslategrey',
  boxShadow:
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  height: '350px',
  borderRadius: '15px',
  width: '340px',
  top: '6%',
  padding: '20px',
};

export default Login;
