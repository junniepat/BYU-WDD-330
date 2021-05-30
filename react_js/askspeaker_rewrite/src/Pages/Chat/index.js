import React, { useState, useEffect, useContext, useRef } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import BG from '../../images/BG.jpg';

import { setCookie } from '../Login';
import UserContext from '../../UserContext';
import axios from 'axios';
import {
  Row,
  Card,
  Col,
  Form,
  Button,
  Input,
  Tabs,
  List,
  Avatar,
  message,
} from "antd";
import {
  PlusOutlined,
  LoadingOutlined,
  SendOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import moment from "moment-timezone";

import authentication from 'react-azure-b2c';

import generateVideoCallToken from "../../Utilsn/generateVideoCallToken";
import sendAgoraVideoInvite from "../../Utilsn/sendAgoraVideoInvite";
import createTwillioRoom from "../../Utilsn/createTwillioRoom";
import sendTwilioVideoInvite from "../../Utilsn/sendTwilioVideoInvite";
import SearchBar from "../../Utilsn/searchChatUsers";
import PubNub from 'pubnub';
import properties from '../../properties';

import {
  parseMessage,
  createChannel,
  getCookie,
  addMembersips,
  validateToken,

} from '../../utils/multipleFunc';

import { PubNubProvider, usePubNub } from 'pubnub-react';
import Search from '../../Search';
import MenuIcon from '@material-ui/icons/Menu';
import { visitorpanel, VisitormenuStyles } from '../../Search';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
//import  OnlineStandVisitors from './search';
import SecureLS from 'secure-ls';
import { callresponse } from '../Call';
//import {fetchChannelMembers} from './search';
import { CommonLoading } from 'react-loadingg';

import { reducer, initialState } from '../../reducers/authReducer';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function Chat() {
  var ls = new SecureLS({ encodingType: 'aes' });
  const userRes = JSON.parse(ls.get('user') || null);
  var token = getCookie('eveStgMgmt_UserTkn');
  var loginstatus = getCookie('eveStgMgmt_loginstatus');

  axios.defaults.headers.common['authorization'] = 'Bearer ' + token;

  const [notify, setNotification] = useState({});
  const [open, setOpen] = React.useState(false);
  ///const pubnub = usePubNub();
  const {
    dpname_enc,
    dporg_enc,
    pbnbKeys_enc,
    agora_key_enc,
    eventid_param,
    channel_enc,
    speaker_data_enc,
  } = useParams();

  const backlink = `${properties.APP_PATH}/standLoad/${dpname_enc}/${dporg_enc}/${pbnbKeys_enc}/${agora_key_enc}/${eventid_param}/${channel_enc}/${speaker_data_enc}`;
  const senderChannnel = atob(channel_enc);

  const dpname = atob(dpname_enc);
  const dporg = atob(dporg_enc);
  const speaker_data = atob(speaker_data_enc);
  const speaker_vals = speaker_data.split(':and:');
  const speakerid = speaker_vals[0];
  const speakername = speaker_vals[1];
  const pbnbkeys = atob(pbnbKeys_enc);
  const pbnbkeys_vals = pbnbkeys.split(':and:');
  const pbnb_publishKey = pbnbkeys_vals[0];
  const pbnb_subscribeKey = pbnbkeys_vals[1];
  const videoProvider = 'AG';
  const pubnub = new PubNub({
    publishKey: pbnb_publishKey, //properties.PUBLISH_KEY,
    subscribeKey: pbnb_subscribeKey, //properties.SUBSCRIBE_KEY,
    uuid: speakerid,
  });
  const agora_key = atob(agora_key_enc);

  // alert(pbnbkeys_vals);
  // alert(pbnbKeys_enc);

  const senderChannnelPrefix = atob(channel_enc) + '.';
  const listeningChannel = `${senderChannnelPrefix}*`;
  const [eventID, setEventID] = useState(eventid_param);
  const global_ch = 'global_' + eventID;
  const [channels] = useState([listeningChannel]);
  const [subscribeChannels, setSubscribeChannels] = useState([]);
  const [eventVisitors, setEventVisitors] = useState(new Map());
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [scheduler, setScheduler] = useState(false);


  const [messages, addMessage] = useState([]);
    const [newMsgSenderIDList, setNewMsgSenderIDList] = useState([]);
  const [msgDetailMap, setMsgDetailMap] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageUsersList, setMessageUsersList] = useState([]);
  const [chatUserName, setChatUserName] = useState("");
  const [msgObject, setMsgObject] = useState(null);
  const [loader, setLoader] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);
  const [chatReadStatusMap, setChatReadStatusMap] = useState([]);
  const [clicks, setClick] = useState(false);

  const { TabPane } = Tabs;
  const { TextArea } = Input;
  var tmp = [];


  useEffect(() => {
    var a = [];
    sessionStorage.setItem("currentChatSenderID_" + senderChannnel, "");
    // var status_api = validateToken(token);
    var status = 0;
    // status_api.then(function(status) {
    // if (status == 200 && loginstatus == 'loggedin') {
    var channel_list = getChannelList();
    //console.log(channel_list);

    channel_list.then((channels_subs) => {
      pubnub.fetchMessages(
        {
          channels: channels_subs, //['qna.58_11.1327','qna.58_11.30'],
          count: 25,
        },
        (status, response) => {
          if (status.statusCode == 200) {
            for (let key in response["channels"]) {
              let channel = response["channels"][key];
              channel.forEach((element) => {
                addMessage((messages) => [...messages, element["message"]]);
              });
            }
          }
        }
      );

      ////console.log("Fetching msgs again and again");
      pubnub.addListener({ message: handleMessage });
      pubnub.subscribe({ channels });

    });
  }, []);

  useEffect(() => {
    groupSenders(messages);
    ////console.log(newMsgSenderIDList);
    if (newMsgSenderIDList.length > 0) {
      tmp = new Set([...newMsgSenderIDList]);
      ////console.log(tmp);
      newMsgSenderIDList.map((key, index) => {
        if (key != speakerid) pushNotification(key);
        newMsgSenderIDList.splice(index, 1);
      });
    }
    ////console.log(senderDetailMap);
  }, [messages]);

  const handleMessage = (event) => {
    // console.log("NEW MESSAGE RECEIVED!!!!");
    // console.log(event);
    const message = event.message;
    var currentChatSenderID = sessionStorage.getItem(
      'currentChatSenderID_' + senderChannnel
    );
   
    if (typeof message === 'string' || message.hasOwnProperty('text')) {
      const text = message.text || message;
    
      const m = parseMessage(message);
  
      // console.log(senderDetailMap.keys());

      if(m.command === 3) {
        addMessage(messages => [...messages, text]);
        console.log("New message added!!!!!!!!!!", text);
        if (
          m.SenderID == currentChatSenderID ||
          m.TargetId == currentChatSenderID
        ) {
          
          // var mymsg = m.Message;
          // if (mymsg.startsWith('My resume has been submitted:')) {
          //   var link = mymsg.substring(
          //     mymsg.indexOf('d:') + 2,
          //     mymsg.length
          //   );
          //   mymsg =
          //     'My resume has been submitted. Click <a href="' +
          //     link +
          //     '" style="color: red;" target="_blank" >here</a> to review';
          // }
          console.log('parsemsg1', m);
          addnewMessage(m);
          if (currentChatSenderID == m.SenderID) {
            // if(currentChatSenderID!="" && currentChatSenderID!=null)
            // console.log(currentChatSenderID);
            console.log('parsemsg2', m);
            addnewMessage(m);
            var chatReadStatusMap_upd = chatReadStatusMap.delete(
              m.SenderID
            );
            setChatReadStatusMap(chatReadStatusMap_upd);
          } else if (speakerid == m.SenderID && m.Sender != dpname) {
            //  if(currentChatSenderID!="" && currentChatSenderID!=null)
            // console.log(currentChatSenderID);
            console.log('parsemsg3', m);
            addnewMessage(m);
            var chatReadStatusMap_upd = chatReadStatusMap.delete(
              m.SenderID
            );
            setChatReadStatusMap(chatReadStatusMap_upd);
          }
          pushNotification(m.SenderID);
        }
      }


      tmp = [];
      tmp.push(m.SenderID);
      setNewMsgSenderIDList([...newMsgSenderIDList], tmp);
  };
}


const addnewMessage = (speakerid, user, message) => {
    if (message != '' && message != null) {
      var date1 = new Date() / 1000;
  
      console.log('new message', user, message);
      setMsgObject(prevState => [...prevState, {
        UserID: speakerid,
        UserName: user,
        receiverID: 0,
        TimeStamp: date1,
        Message: message,
      }]);
    }
  };


  function parseMessage(message) {
    let res = "";
    try {
      res = JSON.parse(message);
    } catch (e) {}
    return res;
  }


  const serializeMessage = (message, myeventVisitors) => {
    var receiverID = sessionStorage.getItem(
      'currentChatSenderID_' + senderChannnel
    );
    const dateTime = Date.now();
    ////console.log("this is the targetid" + receiverID)
    const timestamp = Math.floor(dateTime / 1000);

    let data = {
      Command: 3,
      Sender: dpname, //speakername,
      SenderID: speakerid,
      TargetId: receiverID,
      TargetName: myeventVisitors.get(String(receiverID)),
      TargetChannel: senderChannnelPrefix + receiverID,
      Message: message,
      TimeStamp: timestamp,
      EventID: eventID,
      callRoomID: '',
    };
    //let data = { "Command": 3, "Sender": "Visitor", "SenderID": "30001", "TargetId": "20875", "TargetChannel": "qna.58_11.20875", "Message": message, "TimeStamp": timestamp, "EventID": "58", "callRoomID": "" };
    return JSON.stringify(data);
  };


  function getChannelList() {
    sessionStorage.setItem("SubscriptionChannels", []);
    var url =
      "https://ps.pndsn.com/v2/objects/" +
      pbnb_subscribeKey +
      "/channels?filter=name LIKE '" +
      listeningChannel +
      "'";
    var channel_list = [];
    var myHeaders = new Headers();
    //var channellist =[];
    myHeaders.append("Content-Type", "application/json");
    var requestOptions = {
      method: "GET",
      headers: myHeaders,
    };
    var channellist = fetch(url, requestOptions)
      .then((response) => response.json())
      .then((responseJson) => {
        var alist = [];
        var rawdata = responseJson["data"];
        if (rawdata.length > 0) {
          rawdata.map((data, index) => {
            alist.push(data.id);
          });
        }
        //alist.push('global_' + eventID);
        return alist;
      })
      .catch((err) => {
        console.log("ERROR: " + err);
      });
    return channellist;
  }

  function startVideoCall() {
    console.log('hit videoCall', videoProvider)
    setLoader(true);
    if (videoProvider == 'AG') {
      startAgoraVideoCall();
    } else if (videoProvider == 'TW') {
      startTwilioVideoCall();
    }
  }


  
  function startAgoraVideoCall() {
    var senderid = speakerid;
    var receiverid = 'currentChatSenderID_' + senderChannnel;
    console.log("receiverid", receiverid);
    var receivername = '';
    if (
      typeof eventVisitors.get(receiverid) != 'undefined' &&
      eventVisitors.get(receiverid) !== '' &&
      eventVisitors.get(receiverid) != null
    ) {
      receivername = eventVisitors.get(receiverid);
    }

    var ch_id =
      senderid > receiverid
        ? receiverid + '_' + senderid
        : senderid + '_' + receiverid;
    var dateTime = Date.now();
    ////console.log("this is the targetid" + receiverID)
    const timestamp = Math.floor(dateTime / 1000);
    var channel = 'video-' + ch_id + '_' + eventID + '-' + timestamp;
    console.log('channel', channel);
    // var uuid = btoa('caller_' + speakerid);
    var videotoken_api = generateVideoCallToken(channel);
    var callers = dpname + ':and:' + receivername;
    var caller_enc = btoa(callers);
    console.log(senderChannnel);
    videotoken_api
      .then(function(response) {
        var video_token = response.token;
        console.log(video_token);
        console.log(channel);
        sendAgoraVideoInvite(channel, video_token);
        setIsVideoCall(true);
        setCookie('vdo_callername_' + senderChannnel, caller_enc, 1);
        setCookie('vdo_agAppid_' + senderChannnel, agora_key_enc, 1);
        setCookie('vdo_Tkn_' + senderChannnel, btoa(video_token), 1);
        setCookie('vdo_channel_' + senderChannnel, btoa(channel), 1);
        setLoader(true);
      })
      .catch(err => {
        console.log('ERROR: ' + err);
        console.log('ERROR: ' + JSON.stringify(err.status));
      });
  }


  function startTwilioVideoCall(myeventVisitors) {
    var receiverID = sessionStorage.getItem(
      'currentChatSenderID_' + senderChannnel
    );
    var dateTime = Date.now();
    const timestamp = Math.floor(dateTime / 1000);

    var ch_id = '';
    if (parseInt(receiverID) < parseInt(speakerid))
      ch_id = receiverID + '_' + speakerid;
    else ch_id = speakerid + '_' + receiverID;

    var roomname = 'video-' + ch_id + '_' + eventID + '-' + timestamp;
    var evetoken = getCookie('eveStgMgmt_UserTkn');
    var roomid_api = createTwillioRoom(roomname, evetoken);
    console.log(roomid_api);
    //
    roomid_api.then(function(response) {
      console.log(response);
      var roomid = response; //roomid_api['roomUniqueID'];
      var currentTimestamp = new Date().getTime();
      var receivername = myeventVisitors.get(String(receiverID));
      var caller_link =
        'https://evewrtc2.azureedge.net/room/' +
        roomname +
        '/' +
        currentTimestamp; //+"/"+receivername+"/"+evetoken;
      // sendMessage(msg);
      sendTwilioVideoInvite(caller_link);
      //var my_link = "https://wrtc.eve.tech/room/"+roomname+"/"+roomid+"/"+currentTimestamp+"/"+speakername+"/"+evetoken;
      var my_link = `https://evewrtc2.azureedge.net/room/${roomname}/${currentTimestamp}/${speakername}/${evetoken}`;
      window.open(my_link);
    });
  }


  const loadMessages = (
    senderId, eventID,
    senderChannnelPrefix,
    messagesMap, channnel,
    myspeakerid, callback,
    receivername, loader,

  ) => {
    if (!loader) {
      var target_channel = senderChannnelPrefix + senderId;
      callback(senderId, eventID, target_channel);
      // sessionStorage.setItem("currentChatSenderID_" + channnel, senderId);
      sessionStorage.setItem("currentChatSenderID_", channnel, senderId);
      var Sendermessages = messagesMap.get(senderId);
      // console.log('message', messagesMap);

      setChatUserName(receivername);
      if (typeof Sendermessages === "undefined" || Sendermessages == null) {
        setMessageHistory("");
      } else {
        var objs = Sendermessages.map(function (item) {
          return {
            UserID: item[0],
            UserName: item[1],
            receiverID: item[2],
            TimeStamp: item[3],
            Message: item[4],
          };
        });
        console.log("objs", objs);
        setMsgObject(objs);
      }
    }
    // bottomRef.current.scrollIntoView({ behavior: "smooth" });
  };



  const sendMessage = (message) => {
    if (message != '' && message != null) {
      var visitorid = sessionStorage.getItem(
        'currentChatSenderID_' + senderChannnel
      );
      var target_channel = senderChannnelPrefix + visitorid;
      if (message) {
        createChannel(pubnub, target_channel);
        //sendInvite(visitorid, eventID, target_channel);
        pubnub
          .publish({ channel: target_channel, message })
          .then(() => setMessage(''));
        console.log(message);
      }
    }
  };


  function storeNewUsers(visitorid, visitorname) {
  //   var a = eventVisitors;
  //   a.set(visitorid, visitorname);
  //   setEventVisitors(new Map(a));
  }

  function sendInvite(visitorid, eventid, target_channel) {
    //console.log('Sending invite for eve notification');
    // var visitorid = sessionStorage.getItem(
    //   'currentChatSenderID_' + senderChannnel
    // );
    ////console.log(visitorid);
    ////console.log(receiverID);
    // if (userRes.isPubnub === true) {
    // var global_channel = 'global_' + eventid;
    // addMembersips(pubnub, visitorid, target_channel);
    // const dateTime = Date.now();
    // const timestamp = Math.floor(dateTime / 1000);
    // let message = {
    //   Command: 0,
    //   Sender: speakername,
    //   SenderID: speakerid,
    //   TargetId: visitorid,
    //   TargetName: '',
    //   TargetChannel: senderChannnelPrefix + visitorid,
    //   Message: '',
    //   TimeStamp: timestamp,
    //   EventID: eventID,
    //   callRoomID: '',
    // };
    // //var message = { "Command": 0, "Sender": speakername, "SenderID": speakerid, "TargetId": receiverID, "TargetName": "", "TargetChannel": target_channel, "Message": "", "TimeStamp": timestamp, "EventID": eventid, "callRoomID": "" };
    // var data = JSON.stringify(message);
    // var data = JSON.stringify(message);
    // pubnub
    //   .publish({ channel: global_channel, message: data })
    //   .then(response => {
    //     //console.log('sendInvite Response status:' + response.status);
    //     setMessage('');
    //   })
    //   .catch(err => {
    //     console.log('ERROR: ' + JSON.stringify(err.status));
    //     console.log('ERROR: ' + err);
    //   });
  }


  function sendMeetingCancel(){
  // //   var visitorid = sessionStorage.getItem('currentChatSenderID_' + senderChannnel);
  // //   var global_channel = 'global_' + eventID;
  // //   const dateTime = Date.now();
  // //   const timestamp = Math.floor(dateTime / 1000);
  // //   let message = {
  // //     Command: 8,
  // //     Sender: speakername,
  // //     SenderID: speakerid,
  // //     TargetId: visitorid,
  // //     TargetName: '',
  // //     TargetChannel: global_channel,
  // //     Message: '',
  // //     TimeStamp: timestamp,
  // //     EventID: eventID,
  // //     callRoomID: '',
  // //   };
  // //   console.log(message);
  // //   var data = JSON.stringify(message);
  // //   // console.log(data);
  // //   console.log('sending call cancel');
  // //   if (isPubNubEnabled == 'false') {
  // //     console.log('Calling web socklet');
  // //     FireWsSocket(data);
  // //   } else {
  // //     pubnub
  // //       .publish({ channel: global_channel, message: data })
  // //       .then(response => {
  // //         //console.log('sendInvite Response status:' + response.status);
  // //         setMessage('');
  // //       })
  // //       .catch(err => {
  // //         console.log('ERROR: ' + JSON.stringify(err.status));
  // //         console.log('ERROR: ' + err);
  // //       });
  // //   }
  // // }

  // function startTwilioVideoCall(myeventVisitors) {
  //   var receiverID = sessionStorage.getItem(
  //     'currentChatSenderID_' + senderChannnel
  //   );
  //   var dateTime = Date.now();
  //   const timestamp = Math.floor(dateTime / 1000);

  //   var ch_id = '';
  //   if (parseInt(receiverID) < parseInt(speakerid))
  //     ch_id = receiverID + '_' + speakerid;
  //   else ch_id = speakerid + '_' + receiverID;

  //   var roomname = 'video-' + ch_id + '_' + eventID + '-' + timestamp;

  //   // var roomname =
  //   //   'eve_video_' + speakerid + '_' + receiverID + '_' + timestamp;

  //   var evetoken = getCookie('eveStgMgmt_UserTkn');
  //   var roomid_api = createTwillioRoom(roomname, evetoken);
  //   console.log(roomid_api);
  //   //
  //   roomid_api.then(function(response) {
  //     console.log(response);
  //     var roomid = response; //roomid_api['roomUniqueID'];
  //     var currentTimestamp = new Date().getTime();
  //     var receivername = myeventVisitors.get(String(receiverID));

  //     //https://evewrtc2.azureedge.net/room/:room_id/:timestamp/:username/:eve_jwt

  //     //var caller_link = "https://wrtc.eve.tech/room/"+roomname+"/"+roomid+"/"+currentTimestamp+"/"+receivername+"/"+evetoken;
  //     var caller_link =
  //       'https://evewrtc2.azureedge.net/room/' +
  //       roomname +
  //       '/' +
  //       currentTimestamp; //+"/"+receivername+"/"+evetoken;
  //     // var message = "Please join the meeting in the below  link : "+caller_link;
  //     // var msg = serializeMessage(caller_link, myeventVisitors);
  //     // sendMessage(msg);
  //     sendTwilioVideoInvite(caller_link);
  //     //addnewMessage('You', message);
  //     //var my_link = "https://wrtc.eve.tech/room/"+roomname+"/"+roomid+"/"+currentTimestamp+"/"+speakername+"/"+evetoken;
  //     var my_link = `https://evewrtc2.azureedge.net/room/${roomname}/${currentTimestamp}/${speakername}/${evetoken}`;
  //     window.open(my_link);
  //   });
  }

  function groupSenders(messages) {
    // console.log(messages);
    var tmp = [];
    var fullsenderlist = [];
    var messageList = [];
    var msgMap = new Map();
    var readStatusMap = new Map();
    var tmpsenderdetailMap = new Map();
    var test = new Map();
    test.set(0, "");
    var test2 = [];
    var fetchlist = [
      ...new Set(
        messages.map((message) => {
          var msg = parseMessage(message);
          if (msg.Command == 3) {
            messageList.push([
              msg.SenderID,
              msg.Sender,
              msg.TargetId,
              msg.TimeStamp,
              msg.Message,
            ]);
            if (msg.SenderID == speakerid && msg.TargetId != speakerid) {
              if (
                msg.TargetId != "" &&
                msg.TargetId != null &&
                typeof msg.TargetId != "undefined"
              ) {
                // console.log("msg.TargetId, msg.TargetName,", [msg.TargetId, msg.TargetName, msg.TimeStamp]);
                fullsenderlist.push([
                  msg.TargetId,
                  msg.TargetName,
                  msg.TimeStamp,
                ]);
              }
            } else if (msg.SenderID != speakerid && msg.TargetId == speakerid) {
              if (
                msg.SenderID != "" &&
                msg.SenderID != null &&
                typeof msg.SenderID != "undefined"
              ) {
                // console.log([msg.SenderID, msg.Sender, msg.TimeStamp]);
                fullsenderlist.push([msg.SenderID, msg.Sender, msg.TimeStamp]);
              }
            } else if (msg.SenderID != speakerid && msg.TargetId != speakerid) {
              if (
                msg.TargetId != "" &&
                msg.TargetId != null &&
                typeof msg.TargetId != "undefined"
              ) {
                // console.log([msg.TargetId, msg.TargetName, msg.TimeStamp]);
                //because only  exhibitors can initiate conversation with visitors
                fullsenderlist.push([
                  msg.TargetId,
                  msg.TargetName,
                  msg.TimeStamp,
                ]);
              }
            }
          }
        })
      ),
    ];

    // console.log("fullsenderlist", fullsenderlist)
    tmp = fetchlist;
    var sortedSenderDetailList = fullsenderlist.sort(function (a, b) {
      return b[2] - a[2];
    });

    sortedSenderDetailList.map((s, index) => {
      if (
        typeof eventVisitors.get(String(s[0])) == "undefined" ||
        eventVisitors.get(String(s[0])) == null
      ) {
        storeNewUsers(s[0], s[1]);
      }
      //if(s[0]!=speakerid)
      tmpsenderdetailMap.set(s[0], s[1]);
    });

    // console.log("tmpsenderdetailMap", tmpsenderdetailMap);
    tmpsenderdetailMap.forEach((value, key, map) => {
      let msgs = messageList.filter((it) => it[0] == key || it[2] == key);
      msgMap.set(key, msgs);
      var len = msgs.length;
      //////console.log(len);
      var lastmsg = msgs[len - 1];
      //////console.log(lastmsg);
      if (lastmsg[0] == speakerid) {
        readStatusMap.set(key, false);
      } else {
        readStatusMap.set(key, true);
      }
      return msgMap;
    });

    // console.log(sortedSenderDetailList);
    // console.log("tmpsenderdetailMap", tmpsenderdetailMap);
    setMessageUsersList(tmpsenderdetailMap);
    setMsgDetailMap(msgMap);
    setChatReadStatusMap(readStatusMap);
    //console.log("tmpsenderdetailMap[0].key", tmpsenderdetailMap[0].key);
    // return msgMap;
  }

  // const OnlineStandVisitors = () => {
  //   try {
  //     return (
  //       <div>
  //         {[...standOnlineMap.keys()].map((myvisitorid, index) => (
  //           <div
  //             key={myvisitorid}
  //             id={'StandVisitor_' + myvisitorid.toString()}
  //             style={VisitormenuStyles}
  //             onClick={() => {
  //               if (!loader) {
  //                 loadMessages(
  //                   myvisitorid,
  //                   eventID,
  //                   senderChannnelPrefix,
  //                   msgDetailMap,
  //                   senderChannnel,
  //                   speakerid,
  //                   sendInvite,
  //                   standOnlineMap.get(myvisitorid),
  //                   loader,
  //                   dpname
  //                 );
  //               }
  //             }}
  //           >
  //             <span style={visitorname}>{standOnlineMap.get(myvisitorid)}</span>
  //           </div>
  //         ))}
  //       </div>
  //     );
  //   } catch (e) {
  //     console.log('ERROR' + e);
  //   }
  // };

  // function LinkTab(props) {
  //   return (
  //     <Tab
  //       component="a"
  //       onClick={event => {
  //         event.preventDefault();
  //       }}
  //       {...props}
  //     />
  //   );
  // }

  // const [anchorEl, setAnchorEl] = React.useState(null);

  // const handleClick = event => {
  //   setAnchorEl(event.currentTarget);
  // };


  const pushNotification = (userid) => {
    // var element = document.querySelectorAll('[id="notify_' + userid + '"]');
    // if (element.length > 0 && element != null) {
    //   document.getElementById('notify_' + userid).style.height = '10px';
    //   document.getElementById('notify_' + userid).style.width = '10px';
    // }
  };


const AlwaysScrollToBottom = () => {
  const elementRef = useRef();
  useEffect(() => elementRef.current.scrollIntoView());
  return <div ref={elementRef} />;
};


  return (
    <>
        <Card bordered={false} loading={loading}>
          <PubNubProvider client={pubnub}>
            <h2 style={{ marginBottom: "20px" }}>Live Chat Center</h2>
            <div className="chat_screen" id="chat_screen">
              <Row>
                <Col
                  sm={{ span: 24 }}
                  xs={{ span: 24 }}
                  md={{ span: 12 }}
                  lg={{ span: 6 }}
                  style={{ borderRight: "1px solid #f2f2f2" }}
                >
                  <div className="chatUserList" id="style-2">
                    <List
                      itemLayout="horizontal"
                      dataSource={[...messageUsersList.keys()]}
                      renderItem={(key) => {
                        if (key !== speakerid) {
                          return (
                            <List.Item
                              className={clicks === key ? 'normal_message active' : 'normal_message inactive'}
                              key={key}
                              id={"Sender_" + key}
                              onClick={() => {
                                if (!loader) {
                                  loadMessages(
                                    key,
                                    eventID,
                                    senderChannnelPrefix,
                                    msgDetailMap,
                                    senderChannnel,
                                    speakerid,
                                    sendInvite,
                                    messageUsersList.get(key),
                                    loader
                                  );
                                  setClick(key)
                                }
                              }}
                            >
                              <div key={`message-${key}`}>
                                <div>
                                  <div className="userChatPic">
                                    {(messageUsersList &&
                                      messageUsersList.get(key)?.charAt(0)) ||
                                      "Me"}
                                  </div>
                                  <div className="userChatMessage">
                                    {messageUsersList.get(key)}
                                  </div>

                                  {/* {chatReadStatusMap.get(key) && (
                                      <div id={'notify_' + key} style={circle_true}></div>
                                    )}

                                    {!chatReadStatusMap.get(key) && (
                                      <div id={'notify_' + key} style={circle_false}></div>
                                    )} */}

                                </div>
                              </div>
                            </List.Item>
                          );
                        }
                      }}
                    />
                  </div>
                </Col>

                <Col
                  sm={{ span: 24 }}
                  xs={{ span: 24 }}
                  md={{ span: 12 }}
                  lg={{ span: 12 }}
                  style={{ padding: "0px" }}
                >
                  <div className="card-container" style={{ height: "85vh" }}>
                    {chatUserName && chatUserName.length !== '' ? (
                      <>
                        <div
                          className="card-container"
                          style={{
                            height: "60px",
                            backgroundColor: "#fff",
                            padding: "15px",
                            clear: "both",
                          }}
                        >
                          <div className="userChatPic">
                            {(chatUserName && chatUserName?.charAt(0)) || "Me"}
                          </div>
                          <div className="userChatMessage">
                            <h3> {chatUserName}</h3>
                          </div>
                        </div>

                        <div className="card-container-chat" id="MsgFrame">
                          {msgObject &&
                            msgObject.map((item, index) => (
                              <div key={index}>
                                {item.UserID !== speakerid ? (
                                  <div className="chat_cover">
                                    <Col className="chat_left">
                                      <Row>
                                        <Col
                                          sm={{ span: 24 }}
                                          xs={{ span: 24 }}
                                          md={{ span: 24 }}
                                          lg={{ span: 24 }}
                                        >
                                          {" "}
                                          <span className="chat_name">
                                            {" "}
                                            {item.UserName}{" "}
                                          </span>{" "}
                                          <span className="chat_date">
                                            {moment(
                                              item.TimeStamp * 1000
                                            ).format("MM/D/YY, h:mm a")}
                                          </span>
                                        </Col>

                                        <Col
                                          sm={{ span: 24 }}
                                          xs={{ span: 24 }}
                                          md={{ span: 24 }}
                                          lg={{ span: 24 }}
                                        >
                                          {item.Message.startsWith(
                                            "My resume has been submitted"
                                          )
                                            ? "resume"
                                            : item.Message}
                                        </Col>
                                      </Row>
                                    </Col>
                                  </div>
                                ) : (
                                  <div className="chat_cover">
                                    <Col className="chat_right">
                                      <Row>
                                        <Col
                                          sm={{ span: 24 }}
                                          xs={{ span: 24 }}
                                          md={{ span: 24 }}
                                          lg={{ span: 24 }}
                                        >
                                          {" "}
                                          <span className="chat_name">
                                            {" "}
                                            Me{" "}
                                          </span>{" "}
                                          <span className="chat_date">
                                            {moment(
                                              item.TimeStamp * 1000
                                            ).format("MM/D/YY, h:mm a")}
                                          </span>
                                        </Col>

                                        <Col
                                          sm={{ span: 24 }}
                                          xs={{ span: 24 }}
                                          md={{ span: 24 }}
                                          lg={{ span: 24 }}
                                        >
                                          {item.Message.startsWith(
                                            "My resume has been submitted"
                                          )
                                            ? "resume"
                                            : item.Message}
                                        </Col>
                                      </Row>
                                    </Col>
                                  </div>
                                )}{" "}
                              </div>
                            ))}
                            <AlwaysScrollToBottom />
                        </div>

                        <div
                          className="card-container"
                          style={{
                            height: "70px",
                            backgroundColor: "#fff",
                            padding: "15px",
                          }}
                        >
                          <Form>
                            <Row>
                              <Col
                                sm={{ span: 24 }}
                                xs={{ span: 24 }}
                                md={{ span: 12 }}
                                lg={{ span: 19 }}
                              >
                                <Form.Item>
                                  <TextArea
                                    bordered={false}
                                    TextArea
                                    placeholder="Type your message"
                                    value={message}
                                    onKeyPress={e => {
                                      if (message != '' && message != null) {
                                        if (e.key !== 'Enter') return;
                                        var visitorid = sessionStorage.getItem(
                                          'currentChatSenderID_' + senderChannnel
                                        );
                                        sendMessage(
                                          serializeMessage(message, eventVisitors)
                                        );
                                        addnewMessage(speakerid, 'You', message);
                                      }
                                    }}
                                    onChange={e => setMessage(e.target.value)}
                                  />
                                </Form.Item>
                              </Col>

                              <Col
                                sm={{ span: 24 }}
                                xs={{ span: 24 }}
                                md={{ span: 12 }}
                                lg={{ span: 2 }}
                              >
                                <Button type="link" onClick={() => startVideoCall()}>
                                  <VideoCameraOutlined />
                                </Button>
                              </Col>

                              <Col
                                sm={{ span: 24 }}
                                xs={{ span: 24 }}
                                md={{ span: 12 }}
                                lg={{ span: 3 }}
                              >
                                <Button block htmlType="submit"
                                onClick={e => {
                                e.preventDefault();
                                if (message !== '' && message !== null) {
                                  sendMessage(
                                    serializeMessage(message, eventVisitors)
                                  );
                                  addnewMessage(speakerid, 'You', message);
                                }
                              }}
                              disabled={!message}>
                                  <SendOutlined />
                                </Button>
                              </Col>
                            </Row>
                          </Form>
                        </div>
                      </>
                    ) : (
                      "Click a user name"
                    )}
                  </div>
                </Col>

                <Col
                  sm={{ span: 24 }}
                  xs={{ span: 24 }}
                  md={{ span: 12 }}
                  lg={{ span: 6 }}
                  style={{ borderLeft: "1px solid #f2f2f2" }}
                >
                  <div
                    className="card-container"
                    style={{ height: "85vh", overflowY: "scroll" }}
                  >
                    <Tabs type="card">
                      <TabPane tab="Online" key="1">
                      {/* <Search
                          placeholder="Search online users"
                          allowClear
                          size="large"
                          // onSearch={onSearch}
                          enterButton
                        /> */}
                  <SearchBar
                    pubnub={pubnub}
                    msgDetailmap={msgDetailMap}
                    callback1={storeNewUsers}
                    channel={senderChannnel}
                    myspeakerid={speakerid}
                    eventID={eventID}
                    senderChannnel={senderChannnelPrefix}
                    sendInviteCallback={sendInvite}
                    dpname={dpname}
                  />
                        {/* <List
                                                    itemLayout="horizontal"
                                                    dataSource={data}
                                                    renderItem={item => (
                                                        <List.Item>
                                                            <List.Item.Meta
                                                                avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                                                                title={<a href="https://ant.design">{item.title}</a>}
                                                                description="A quick message from me"
                                                            />
                                                        </List.Item>
                                                    )}
                                                /> */}
                      </TabPane>
                      <TabPane tab="On Stand" key="2">
                        {/* <List
                                                    itemLayout="horizontal"
                                                    dataSource={data}
                                                    renderItem={item => (
                                                        <List.Item>
                                                            <List.Item.Meta
                                                                avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                                                                title={<a href="https://ant.design">{item.title}</a>}
                                                                description="A quick message from me"
                                                            />
                                                        </List.Item>
                                                    )}
                                                /> */}
                      </TabPane>
                    </Tabs>
                  </div>
                </Col>
              </Row>
            </div>
          </PubNubProvider>
        </Card>
    
    </>
  );
}



