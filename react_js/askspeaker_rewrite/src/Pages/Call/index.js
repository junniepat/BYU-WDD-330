import React, { useState, useEffect } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import useAgora from '../../hooks/useAgora';
import MediaPlayer from '../../components/MediaPlayer';
import CountdownTimer from 'react-component-countdown-timer';
import './Call.css';
import { getCookie } from '../../utils/multipleFunc';
import { setCookie } from '../Login';
import BG from '../../images/BG.jpg';
import buttonimg from '../../images/button.jpg';
const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' }); //h264
//AgoraRTC.setLogLevel(1);

export function callresponse(senderChannel) {
  window.close();
  setCookie('vdo_agAppid_' + senderChannel, '', 1);
  setCookie('vdo_callername_' + senderChannel, '', 1);
  setCookie('vdo_Tkn_' + senderChannel, 'loggout', 1);
  setCookie('vdo_channel_' + senderChannel, 'loggout', 1);
}

function Call() {
  const { senderChannel_enc, start_ts, callerid_enc } = useParams();

  var senderChannel = atob(senderChannel_enc);

  var a = atob(callerid_enc);
  var uid = a.replace('caller_', '');

  var cki_agoraappid = getCookie('vdo_agAppid_' + senderChannel);
  var agora_appid = atob(cki_agoraappid);

  var cki_callername = getCookie('vdo_callername_' + senderChannel);

  var callernames_dec = atob(cki_callername);
  var callernames = callernames_dec.split(':and:');

  const dpname = callernames[0];
  const rname = callernames[1];

  var cki_token = getCookie('vdo_Tkn_' + senderChannel);
  var agora_token = atob(cki_token);

  var cki_vchannel = getCookie('vdo_channel_' + senderChannel);
  var agora_channel = atob(cki_vchannel);

  var currentTimestamp = new Date().getTime();
  var endTimeStamp = Number(start_ts) + 300000;
  var diffInSec = 0;
  if (Number(endTimeStamp) > Number(currentTimestamp)) {
    diffInSec = Number(endTimeStamp) - Number(currentTimestamp);
    diffInSec /= 1000;
  }

  var istimeup = false;

  setInterval(function() {
    endTimeStamp = Number(start_ts) + 300000;
    currentTimestamp = new Date().getTime();

    if (Number(endTimeStamp) > Number(currentTimestamp)) {
      diffInSec = Number(endTimeStamp) - Number(currentTimestamp);
      diffInSec /= 1000;
    } else {
      if (!istimeup) {
        istimeup = true;
        alert('Session ended!');
        //window.close();
        callresponse(senderChannel);
      }
    }
  }, 3000);

  const videoConfig = { encoderConfig: '720p' };
  const {
    localAudioTrack,
    localVideoTrack,
    leave,
    join,
    joinState,
    remoteUsers,
  } = useAgora(uid, rname, client, videoConfig);

  var timersettings = {
    hideDay: true,
    hideHours: true,
    vertical: false,
    count: diffInSec,
    border: true,
    showTitle: false,
    noPoints: false,
  };

  useEffect(() => {
    var token = decodeURIComponent(agora_token);
    console.log('sending uid to join call :' + uid);
    join(agora_appid, agora_channel, token, uid);
  }, []);

  async function muteAudio() {
    localAudioTrack.setEnabled(false);
    document.getElementById('muteAudio').style.display = 'none';
    document.getElementById('unmuteAudio').style.display = 'block';
  }

  async function muteVideo() {
    await localVideoTrack.setEnabled(false);
    document.getElementById('muteVideo').style.display = 'none';
    document.getElementById('unmuteVideo').style.display = 'block';
  }

  async function unMuteAudio() {
    localAudioTrack.setEnabled(true);
    document.getElementById('unmuteAudio').style.display = 'none';
    document.getElementById('muteAudio').style.display = 'block';
  }

  async function unmuteVideo() {
    await localVideoTrack.setEnabled(true);
    document.getElementById('unmuteVideo').style.display = 'none';
    document.getElementById('muteVideo').style.display = 'block';
  }

  return (
    <div className="call">
      <img src={BG} alt="BG" style={bgimage} />
      <form>
        <div style={headerStyles}>
          <div style={{ position: 'absolute', color: '#D0B00F' }}>
            Video Conferencing
          </div>

          <span style={detailinfo}>
            {/* Logged in as <b>{dpname} </b> */}
            Session ends in &nbsp; <CountdownTimer {...timersettings} />
          </span>

          <button
            id="muteAudio"
            style={muteBtnStyle}
            className="button"
            type="button"
            onClick={() => {
              muteAudio();
            }}
          >
            <span id="audio">Mute Audio</span>
          </button>
          <button
            id="unmuteAudio"
            style={unmuteBtnStyle}
            className="button"
            type="button"
            onClick={() => {
              unMuteAudio();
            }}
          >
            <span id="audio">Unmute Audio</span>
          </button>
          <button
            id="muteVideo"
            style={muteVdoBtnStyle}
            className="button"
            type="button"
            onClick={() => {
              muteVideo();
            }}
          >
            Mute Video
          </button>
          <button
            id="unmuteVideo"
            style={unmuteVdoBtnStyle}
            className="button"
            type="button"
            onClick={() => {
              unmuteVideo();
            }}
          >
            Unmute Video
          </button>
          <button
            style={logoutBtnStyle}
            className="button"
            type="button"
            onClick={() => {
              var promiseA = client.leave();
              promiseA.then(function(response) {
                client.stopProxyServer();
                leave();
                callresponse(senderChannel);
              });
            }}
          >
            Leave
          </button>
        </div>
        {/* <div >
          <button className='button' id='leave' type='button'  onClick={() => {leave()}}>Leave</button>
        </div> */}
      </form>
      <div className="player-container" style={{ display: 'inline-block' }}>
        <div className="gallery">
          <p style={username} className="local-player-text">
            {/* {localVideoTrack && `You`} */}
            {dpname}
          </p>
          <MediaPlayer videoTrack={localVideoTrack}></MediaPlayer>
        </div>

        {remoteUsers.map(user => (
          <div className="gallery" key={user.uid}>
            <p style={username} className="remote-player-text">
              {rname}
            </p>
            <MediaPlayer
              videoTrack={user.videoTrack}
              audioTrack={user.audioTrack}
            ></MediaPlayer>
          </div>
        ))}
      </div>
    </div>
  );
}

const headerStyles = {
  //background: '#323742',
  color: 'white',
  fontSize: '1.4rem',
  padding: '10px 15px',
  height: '6%',
  width: '100%',
  position: 'absolute',
};

const detailinfo = {
  position: 'absolute',
  width: '300px',
  color: 'white',
  height: '40px',
  right: '350px',
  fontSize: '15px',
  paddingTop: '7px',
};

const logoutBtnStyle = {
  position: 'absolute',
  width: '125px ',
  //color: 'white',
  height: '40px',
  marginBottom: '20px',
  //background: 'linear-gradient(rgb(142, 45, 226) 0%, rgb(74, 0, 224) 101%)',
  borderRadius: '8px',
  backgroundImage: 'url(' + buttonimg + ')',
  color: 'rgb(142, 45, 226) !important',
  backgroundRepeat: 'no-repeat  ',
  right: '25px',
};

const muteVdoBtnStyle = {
  position: 'absolute',
  width: '125px',
  //color: 'white',
  height: '40px',
  marginBottom: '20px',
  //background: 'linear-gradient(rgb(142, 45, 226) 0%, rgb(74, 0, 224) 101%)',
  borderRadius: '8px',
  backgroundImage: 'url(' + buttonimg + ')',
  color: 'rgb(142, 45, 226) !important',
  backgroundRepeat: 'no-repeat  ',
  right: '165px',
  display: 'block',
};

const unmuteVdoBtnStyle = {
  position: 'absolute',
  width: '125px',
  // color: 'white',
  height: '40px',
  marginBottom: '20px',
  //background: 'linear-gradient(rgb(142, 45, 226) 0%, rgb(74, 0, 224) 101%)',
  borderRadius: '8px',
  backgroundImage: 'url(' + buttonimg + ')',
  color: 'rgb(142, 45, 226) !important',
  backgroundRepeat: 'no-repeat  ',
  right: '165px',
  display: 'none',
};

const muteBtnStyle = {
  position: 'absolute',
  width: '125px',
  color: 'white',
  height: '40px',
  marginBottom: '20px',
  //background: 'linear-gradient(rgb(142, 45, 226) 0%, rgb(74, 0, 224) 101%)',
  borderRadius: '8px',
  backgroundImage: 'url(' + buttonimg + ')',
  color: 'rgb(142, 45, 226) !important',
  backgroundRepeat: 'no-repeat  ',
  right: '305px',
  display: 'block',
};

const unmuteBtnStyle = {
  color: 'rgb(142, 45, 226) !important',
  position: 'absolute',
  width: '125px',
  // color: 'white',
  height: '40px',
  marginBottom: '20px',
  //background: 'linear-gradient(rgb(142, 45, 226) 0%, rgb(74, 0, 224) 101%)',
  borderRadius: '8px',
  backgroundImage: 'url(' + buttonimg + ')',
  backgroundRepeat: 'no-repeat  ',
  right: '305px',
  display: 'none',
};

const username = {
  color: 'white',
  top: '15%',
  position: 'absolute',
};
const bgimage = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  opacity: 0.3,
};
export default Call;
