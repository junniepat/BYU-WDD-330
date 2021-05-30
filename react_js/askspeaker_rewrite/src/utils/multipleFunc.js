import React, { useState, useEffect, useReducer } from 'react';
import SecureLS from 'secure-ls';
import properties from '../properties';

import { makeStyles, Theme } from '@material-ui/core/styles';

var ls = new SecureLS({ encodingType: 'aes' });

export function parseMessage(message) {
  let res = '';
  try {
    res = JSON.parse(message);
  } catch (e) {}
  return res;
}

// function RedirectLogin() {
//   window.location.href="/login";
// }

export function addMembersips(pubnub, visitorid, channel) {
  var channels = [];
  channels.push(channel);

  pubnub.objects.setMemberships(
    {
      uuid: visitorid,
      channels: [{ id: channel }],
    },
    (response, data) => {
      //console.log('Added Channel membership');
    }
  );
}

export function createChannel(pubnub, channelName) {
  pubnub.objects.setChannelMetadata(
    {
      channel: channelName,
      data: {
        name: channelName,
        description: 'Receiver channel created by sender',
        custom: {
          isPublic: false,
        },
      },
      include: {
        customFields: true,
      },
    },
    (response, data) => {
      if (data.status == 200) console.log('Channel created');
      else console.log('Channel creation failed: ' + data.error);
    }
  );
}

export function getCookie(cname) {
  var name = cname + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

export function validateToken(mycookie) {
  var status = 0;
  var url = properties.BASE_URL + '/api/person/validateToken';
  var myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  var requestOptions = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + mycookie,
    },
  };
  status = fetch(url, requestOptions)
    .then(response => {
      //console.log('Token response: ' + response.status);
      return response.status;
    })
    .catch(err => {
      console.log('ERROR: ' + err);
    });
  return status;
}

const msgFrame = {};

export function createTwillioRoom(roomName, evetokenid) {
  console.log(roomName);
  var room_decoded = decodeURIComponent(roomName);
  var tokenid = decodeURIComponent(evetokenid);
  console.log(room_decoded);
  console.log(evetokenid);
  const url =
    properties.BASE_URL + '/api/videomeeting/createroom?roomid=' + room_decoded;
  var eve_room_id = fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + tokenid,
    },
  })
    .then(resp => {
      console.log(resp);
      return resp.json();
    })
    .then(json => {
      console.log(json);
      if (json.succeeded === true) {
        var roomid = json.roomUniqueID;
        console.log('Twillio roomid:' + roomid);
        return roomid;
      } else {
        return 'ERROR';
      }
    })
    .catch(err => {
      console.log(err);
    });

  return eve_room_id;
}

export const loadMessages = (
  senderId,
  eventID,
  senderChannnelPrefix,
  messagesMap,
  channnel,
  myspeakerid,
  callback,
  receivername,
  loader,
  dpname
) => {
  if (!loader) {
    var target_channel = senderChannnelPrefix + senderId;
    callback(senderId, eventID, target_channel);
    document.getElementById('Visitornametag').innerHTML = receivername;
    document.getElementById('currentConvoVisitorname').style.display = 'block';
    sessionStorage.setItem('currentChatSenderID_' + channnel, senderId);
    var Sendermessages = messagesMap.get(senderId);
    console.log('message', messagesMap);
    console.log('Sendermessages', Sendermessages);
    if (typeof Sendermessages === 'undefined' || Sendermessages == null) {
      var messageHtml = '<div> </div>';
      document.getElementById('Message').innerHTML = messageHtml;
      document.getElementById('sendMessageDiv').style.display = 'flex';
    } else {
      var msg = '';
      var lastestmsgdiv = '';
      var ts = '';
      document.getElementById('MsgFrame').style.height = '75%';
      if (Sendermessages)
        Sendermessages.map((m, index) => {
          //const m = parseMessage(message);
          if (m[0] == senderId || m[2] == senderId) {
            lastestmsgdiv = 'Message_' + index;
            ts = m[3];
            var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
            d.setUTCSeconds(ts);
            var date1 = (d = new Date(d).toLocaleString());
            if (m[4] != null && m[4] != '') {
              if (m[0] == myspeakerid) {
                msg += "<div className='messageRep'><div id='" + lastestmsgdiv;
                if (m[1] == dpname) msg += "'><b>You:  </b>";
                else msg += "'><b>" + m[1] + ':  </b>';
                if (m[4].startsWith('My resume has been submitted:')) {
                  var link = m[4].substring(
                    m[4].indexOf('d:') + 2,
                    m[4].length
                  );
                  msg +=
                    'My resume has been submitted. Please click <a href="' +
                    link +
                    '" style="color: red;" target="_blank" >here</a> to review.';
                } else {
                  msg += m[4];
                }
                msg +=
                  "</div> <div style='font-size:12px;color: darkgrey;'>" +
                  date1 +
                  ' </div></div><br/>';
              } else {
                msg +=
                  "<div className='messageUser'><div id='" +
                  lastestmsgdiv +
                  "'><b>" +
                  m[1] +
                  ': </b>';
                if (m[4].startsWith('My resume has been submitted:')) {
                  var link = m[4].substring(
                    m[4].indexOf('d:') + 2,
                    m[4].length
                  );
                  msg +=
                    'My resume has been submitted. Please click <a href="' +
                    link +
                    '" style="color: red;" target="_blank" >here</a> to review.';
                } else {
                  msg += m[4];
                }
                msg +=
                  "</div> <div style='font-size: 12px;color: darkgrey;'>" +
                  date1 +
                  ' </div></div><br/>';
              }
            }
          }
        });

      var messageHtml = '<div>' + msg + '</div>';
      document.getElementById('Message').innerHTML = messageHtml;
      document.getElementById('sendMessageDiv').style.display = 'flex';
      document.getElementById('MsgFrame').scrollTop = document.getElementById(
        'MsgFrame'
      ).scrollHeight;
      highlightSelectedConvo(senderId);
    }
  }
};

const highlightSelectedConvo = userid => {
  document.querySelectorAll('[id^="Sender_"]').forEach(element => {
    element.style.backgroundColor = '';
  });
  var a = document.getElementById('Sender_' + userid);
  if (a != null && typeof a != 'undefined' && a != '')
    a.style.backgroundColor = 'rgba(0,0,0,0.1)';
};
