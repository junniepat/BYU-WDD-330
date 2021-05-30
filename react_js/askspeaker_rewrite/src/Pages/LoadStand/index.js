import React, { useState, useEffect, useContext } from 'react';
import { Redirect, useParams, useHistory } from 'react-router-dom';
import BG from '../../images/BG.jpg';
import { Typography, Button } from '@material-ui/core';
import { setCookie } from '../Login';
import UserContext from '../../UserContext';
import {
  pagebg,
  //bgimage,
  headerStyles,
  bodyStyle,
  detailinfo,
  inputStyles,
  imgStyle,
  btngroup,
  btnStyle,
} from '../../components/styles';
import properties from '../../properties';
import authentication from 'react-azure-b2c';
import { IconButton } from '@material-ui/core';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

function StandInfo() {
  const { dispatch } = useContext(UserContext);
  const { history } = useHistory();
  const {
    dpname_enc,
    dporg_enc,
    pbnbKeys_enc,
    agora_key_enc,
    eventid_param,
    channel_enc,
    speaker_data_enc,
  } = useParams();
  const [dpnameenc, setDpNameEnc] = useState(dpname_enc);
  const [dpname, setDpname] = useState(atob(dpname_enc));
  const dporg = atob(dporg_enc);
  const channel_name = atob(channel_enc);
  var profileimage = sessionStorage.getItem('ProfileImage_' + channel_name);

  //console.log(profileimage);
  const meetVisitorLink = `${properties.HOME_URL}${properties.APP_PATH}/chat/${dpnameenc}/${dporg_enc}/${pbnbKeys_enc}/${agora_key_enc}/${eventid_param}/${channel_enc}/${speaker_data_enc}`;
  if (
    profileimage == null ||
    profileimage == '' ||
    typeof profileimage == 'undefined'
  ) {
    profileimage =
      'https://evemainstorage.blob.core.windows.net/images/stage_area.jpg';
  }
  function onlogout() {
    authentication.signOut();
  }

  useEffect(() => {
    setDpNameEnc(btoa(dpname));
  }, [dpname]);

  function changeDisplayName(value) {
    setDpname(value);
  }
  return (
    <div style={pagebg}>
      <img src={BG} alt="BG" style={bgimage} />
      <div style={headerStyles}>
        <div
          style={{
            float: 'left',
            //width: '100%',
            // top: '7%',
            color: 'gold',
            fontSize: '30px',
            position: 'relative',
            fontWeight: 'bolder',
            left: '25px',
            fontFamily: 'Comfortaa',
          }}
        >
          <span onClick={() => history.goBack()}>
            <IconButton aria-label="close">
              <ArrowBackIcon
                style={{
                  fontSize: '30px',
                  color: 'gold',
                  fontWeight: 'bolder',
                  marginTop: '-6px',
                  cursor: 'pointer',
                }}
              />
            </IconButton>
          </span>
          CHATBOARD
        </div>

        <div style={bodyStyle}>
          <table style={{ height: '100vh', width: '100%' }}>
            <td
              style={{
                height: '80%',
                width: '60%',
                position: 'relative',
              }}
            >
              <div style={detailinfo}>
                <span>
                  <Typography variant="h6" style={{ fontWeight: 500 }}>
                    Logged in as &nbsp;
                    <input
                      type="text"
                      style={inputStyles}
                      placeholder="Your Display Name"
                      value={dpname}
                      onChange={e => setDpname(e.target.value)}
                    />
                    <div style={{ marginTop: '30px', fontWeight: 'bold' }}>
                      {' '}
                      {dporg}
                    </div>
                  </Typography>
                </span>
              </div>

              <img
                style={imgStyle}
                // src="https://image.winudf.com/v2/image1/Y29tLmVudG91cmFnZS5ldmVfc2NyZWVuXzRfMTU5NTAxNjU4NV8wMjE/screen-5.jpg?fakeurl=1&type=.jpg"
                src={profileimage}
              />
            </td>

            <td>
              <div style={btngroup}>
                <Button
                  id="eventSelectionBtn"
                  //variant="contained"
                  style={btnStyle}
                  color="primary"
                  onClick={() => (window.location.href = meetVisitorLink)}
                >
                  Meet Visitors
                </Button>

                <Button
                  id="eventSelectionBtn"
                  //variant="contained"
                  style={btnStyle}
                  color="primary"
                  onClick={() =>
                    window.open(
                      'https://tawk.to/chat/5fb61a58a1d54c18d8eb22b4/default'
                    )
                  }
                >
                  Helpdesk
                </Button>

                <Button
                  id="eventSelectionBtn"
                  // variant="contained"
                  style={btnStyle}
                  color="primary"
                  onClick={onlogout}
                >
                  Logout
                </Button>
              </div>
            </td>
          </table>
        </div>
      </div>
    </div>
  );
}
const bgimage = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  opacity: 0.6,
};
export default StandInfo;
