import React, { useState, useContext, useEffect } from 'react';
import SecureLS from 'secure-ls';
import UserContext from '../../UserContext';
import { AppContext } from '../../app-context';
import BG from '../../images/BG.jpg';
import EveLogo_V4 from '../../images/EveLogo_V4.png';
import {
  bgimage,
  textBox_event,
  loginpage,
  loginHeader1,
  eventSelectbox,
  loginHeader2,
} from '../../components/styles';
import { IconButton } from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';
import axios from 'axios';
import {
  Select,
  MenuItem,
  Box,
  TextField,
  Button,
  Snackbar,
  LinearProgress,
  Collapse,
} from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import authentication from 'react-azure-b2c';

import properties from '../../properties';
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function LoadEvents() {
  var ls = new SecureLS({ encodingType: 'aes' });
  //const userRes = JSON.parse(ls.get('user') || null);

  const [notify, setNotification] = useState({});
  const [open, setOpen] = useState(false);

  const [eventDetails, setEventDetails] = useState([]);
  const [eventidMap, setEventidMap] = useState([]);
  const [pubnubkeys, setPubnubKeys] = useState([]);
  const [agoraKey, setAgoraKey] = useState([]);
  const [speakerid, setSpeakerId] = useState(0);
  const [speakername, setSpeakerName] = useState('');
  const [company, setCompany] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileimageMap, setProfileImageMap] = useState([]);
  const [standDetailsMap, setStandDetailsMap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(true);

  const [WSUrls, setWSUrl] = useState('');

  const { dispatch } = useContext(UserContext);
  useEffect(() => {}, [eventDetails]);

  function setCookie(cname, cvalue, exdays) {
    //console.log('Setcookie&&&&&&&&&&&&');
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  function getByValue(map, searchValue) {
    for (let [key, value] of map.entries()) {
      if (value === searchValue) return key;
    }
  }

  function LoadContents() {
    //console.log('fired');
    return axios.get(`${properties.BASE_URL}/api/exhibitors/details`);
  }

  function handlestanddetails(res) {
    console.log(3);
    var eventidmap = new Map();
    var eventmap = new Map();
    var pnkeymap = new Map();
    var agorakeymap = new Map();
    var profileimagemap = new Map();
    var standdetailsmap = new Map();
    setUser(res.data.user);

    // ls.set('userDetails', JSON.stringify(res.data.user.standDetails));
    var standDetails = res.data.user.standDetails;
    var visitorid = res.data.user.id;
    if (visitorid) setSpeakerId(visitorid);
    var visitorname = res.data.user.displayName;

    if (visitorname) {
      var t = visitorname.split(' ');
      var a = '';
      if (t[0] > 5) a = t[0];
      else a = t[0] + ' ' + t[1];

      if (a.length > 15) {
        var b = a.substring(0, 14);
        setDisplayName(b);
      } else {
        setDisplayName(a);
      }
    }

    if (visitorname) setSpeakerName(visitorname);
    var visitor_company = res.data.user.company;
    if (visitor_company) setCompany(visitor_company);

    var channelid = '',
      eventid = '',
      standid = '',
      pn_publishkey = '',
      agora_key = '';
    var channelname = '',
      eventname = '',
      standname = '',
      profileimage = '',
      pn_subscribekey = '';

    if (standDetails.length > 0) {
      standDetails.map((value, index) => {
        //console.log(value);
        eventid = value.eventId;
        standid = value.standId;
        eventname = value.eventName;
        standname = value.standName;
        profileimage = value.ProfileURL;
        pn_publishkey = value.pubnubPubKey;
        pn_subscribekey = value.pubnubSubKey;
        agora_key = value.agoraKey;
        setCookie('isPubnubEnabled', JSON.stringify(value.isPubNubEnabled), 1);
        //console.log(eventid);
        //console.log(standid);
        //console.log(standname);
        if (
          eventid == null ||
          eventid == '' ||
          typeof eventid === 'undefined' ||
          eventname == null ||
          eventname == '' ||
          typeof eventname === 'undefined'
        )
          console.log('Event disabled');
        else if (
          standid == null ||
          standid == '' ||
          typeof standid === 'undefined' ||
          standname == null ||
          standname == '' ||
          typeof standname === 'undefined'
        ) {
          setNotification({
            msg: 'Invalid stand fetched',
            severity: 'error',
          });
          setOpen(true);
        } else if (
          pn_publishkey == null ||
          pn_publishkey == '' ||
          typeof pn_publishkey === 'undefined' ||
          pn_subscribekey == null ||
          pn_subscribekey == '' ||
          typeof pn_subscribekey === 'undefined' ||
          agora_key == null ||
          agora_key == '' ||
          typeof agora_key === 'undefined'
        ) {
          setNotification({
            msg: 'Insufficient details',
            severity: 'error',
          });
          setOpen(true);
        } else {
          channelid = standid + '_' + eventid;
          channelname = eventname + ' : ' + standname;

          var pn_keys = pn_publishkey + ':and:' + pn_subscribekey;
          eventmap.set(channelid, channelname);
          eventidmap.set(channelid, eventid);
          pnkeymap.set(channelid, pn_keys);
          agorakeymap.set(channelid, agora_key);
          profileimagemap.set(channelid, profileimage);
          standdetailsmap.set(channelid, standname);
          //console.log(eventmap);
        }
      });
      setStandDetailsMap(standdetailsmap);
      setEventidMap(eventidmap);
      setEventDetails(eventmap);
      setPubnubKeys(pnkeymap);
      setAgoraKey(agorakeymap);
      setProfileImageMap(profileimagemap);

      document.getElementById('loginHeader3').innerHTML =
        'Welcome ' + visitorname + ' !';
    }

    document.getElementById('loginHeader3').innerHTML =
      'Welcome ' + visitorname + ' !';
  }

  useEffect(() => {
    var response = LoadContents();
    response
      .then(res => {
        handlestanddetails(res);
      })
      .catch(err => console.log('err', err));
  }, []);

  const loadDropdownBox = (elementid, items) => {
    var html =
      '<div className="MuiPaper-root MuiMenu-paper MuiPopover-paper MuiPaper-elevation8 MuiPaper-rounded" tabindex="-1" style="opacity: 1; transform: none; min-width: 300px; transition: opacity 251ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, transform 167ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; top: 251px; left: 373px; transform-origin: 0px 26px;"><ul className="MuiList-root MuiMenu-list MuiList-padding" role="listbox" tabindex="-1" aria-labelledby="frmEventNameTxt-label"><li className="MuiButtonBase-root MuiListItem-root MuiMenuItem-root MuiMenuItem-gutters MuiListItem-gutters MuiListItem-button" tabindex="0" role="option" aria-disabled="false" data-value="wetex">WETEX<span className="MuiTouchRipple-root"></span></li><li className="MuiButtonBase-root MuiListItem-root MuiMenuItem-root MuiMenuItem-gutters MuiListItem-gutters MuiListItem-button" tabindex="-1" role="option" aria-disabled="false" data-value="g20">G20<span className="MuiTouchRipple-root"></span></li><li className="MuiButtonBase-root MuiListItem-root MuiMenuItem-root MuiMenuItem-gutters MuiListItem-gutters MuiListItem-button" tabindex="-1" role="option" aria-disabled="false" primarytext="WETEX" data-value="0"><span className="MuiTouchRipple-root"></span></li><li className="MuiButtonBase-root MuiListItem-root MuiMenuItem-root MuiMenuItem-gutters MuiListItem-gutters MuiListItem-button" tabindex="-1" role="option" aria-disabled="false" primarytext="G20" data-value="1"><span className="MuiTouchRipple-root"></span></li><li className="MuiButtonBase-root MuiListItem-root MuiMenuItem-root MuiMenuItem-gutters MuiListItem-gutters MuiListItem-button" tabindex="-1" role="option" aria-disabled="false" primarytext="Mawhiba" data-value="2"><span className="MuiTouchRipple-root"></span></li></ul></div>';
    var component = document.getElementById(elementid);
    for (var index in items) {
      var opt = document.createElement('MenuItem');
      opt.value = items[index];
      opt.innerHTML = items[index]; // whatever property it has

      // then append it to the select element
      component.appendChild(opt);
      //component.appendChild("<br/>");
    }
    //component.innerHTML = html;
  };

  function loadEventOptions(evetoken, username) {
    var eventList = ['WETEX', 'G20', 'Mawhiba'];
    // setEvents(events);
  }

  function loadEventLocation(evetoken, username, locationid) {
    var eventList = ['WETEX', 'G20', 'Mawhiba'];
    loadDropdownBox('frmEventNameTxt', eventList);
  }

  const connectToChat = () => {
    var eventHall = document.getElementById('frmEventNameTxt').innerText;
    if (!eventHall.includes('<span>​</span>')) {
      var ch_id = getByValue(eventDetails, eventHall);
      var event_id = eventidMap.get(ch_id);
      var eventvalue = eventDetails.get(ch_id);
      var a = eventvalue.split(' : ');
      console.log(a[1]);
      //console.log('Seleced: ' + ch_id);
      if (typeof eventHall === 'undefined' || eventHall == null) {
        setNotification({
          msg: 'Please select registered event to proceed to chat.',
          severity: 'error',
        });
        setOpen(true);
      } else {
        var channelName = 'qna.' + ch_id; //+ ".";
        //var channelName = 'qna.' + '21_39'; //+ ".";
        var pbnbkeys = '',
          pbnbKeys_enc = '',
          agora_key = '',
          agora_key_enc = '';
        var profileimg = '';
        var standname = '';
        if (
          typeof pubnubkeys.get(ch_id) != 'undefined' &&
          pubnubkeys.get(ch_id) != null
        ) {
          pbnbkeys = pubnubkeys.get(ch_id);
          pbnbKeys_enc = btoa(pbnbkeys);
        }
        if (
          typeof agoraKey.get(ch_id) != 'undefined' &&
          agoraKey.get(ch_id) != null
        ) {
          //console.log(agoraKey);
          agora_key = agoraKey.get(ch_id);
          agora_key_enc = btoa(agora_key);
        }

        if (
          typeof profileimageMap.get(ch_id) != 'undefined' &&
          profileimageMap.get(ch_id) != null
        ) {
          profileimg = profileimageMap.get(ch_id);
          sessionStorage.setItem('ProfileImage_' + channelName, profileimg);
        }

        if (
          typeof standDetailsMap.get(ch_id) != 'undefined' &&
          standDetailsMap.get(ch_id) != null
        ) {
          standname = standDetailsMap.get(ch_id);
        } else {
          standname = 'N/A';
        }

        var speaker_data_enc = btoa(speakerid + ':and:' + speakername);
        var dpname = btoa(displayName);
        var dporg = btoa(standname);

        const channel_encode = btoa(channelName);
        // window.location.href = `${properties.APP_PATH}/standLoad/${dpname}/${dporg}/${pbnbKeys_enc}/${agora_key_enc}/${event_id}/${channel_encode}/${speaker_data_enc}`;
        window.location.href =
          '/standLoad/' +
          dpname +
          '/' +
          dporg +
          '/' +
          pbnbKeys_enc +
          '/' +
          agora_key_enc +
          '/' +
          event_id +
          '/' +
          channel_encode +
          '/' +
          speaker_data_enc;
      }
    } else {
      setNotification({
        msg: 'Please select your stage/stand to continue',
        severity: 'error',
      });
      setOpen(true);
    }
  };

  function onlogout() {
    setCookie('eveStgMgmt_loginstatus', 'loggout', 1);
    authentication.signOut();
  }

  return (
    <UserContext.Consumer>
      {value => (
        <>
          <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
            <Alert onClose={handleClose} severity={notify.severity}>
              {notify.msg}
            </Alert>
          </Snackbar>

          <div id="Loginpage" style={loginpage}>
            <div
              style={{
                position: 'absolute',
                top: '50px',
                right: '50px',
                zIndex: '99999',
              }}
            >
              <button title="logout" className="closeBtnTwo">
                <IconButton aria-label="close" onClick={() => onlogout()}>
                  <CloseIcon />
                </IconButton>
              </button>
            </div>

            <img src={BG} alt="BG" style={bgimage} />

            <div style={loginHeader1}>
              <img
                src={EveLogo_V4}
                alt="logo"
                style={{
                  height: '150px',
                  width: '155px',
                  opacity: '0.8 !important',
                }}
              />
            </div>

            <div style={eventSelectbox}>
              <span id="loginHeader3" style={loginHeader2}>
                {' '}
                CHATBOARD
              </span>

              <TextField
                style={textBox_event}
                id="frmEventNameTxt"
                label="Exhibitor Stand"
                variant="filled"
                select
              >
                {/* <MenuItem value="wetex">WETEX</MenuItem>
                    <MenuItem value="g20">G20</MenuItem> */}
                {[...eventDetails.keys()].map((key, index) => (
                  <MenuItem
                    key={index}
                    value={key}
                    primaryText={eventDetails.get(key)}
                  >
                    {eventDetails.get(key)}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="text"
                className="form-btn"
                color="primary"
                onClick={connectToChat}
                id="eventSelectionBtn"
              >
                Connect
              </Button>
            </div>
          </div>
        </>
      )}
    </UserContext.Consumer>
  );
}
