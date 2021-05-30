export default async function sendAgoraVideoInvite(target_channel, video_token) {
    //console.log('Sending invite for eve video call');
    // var visitorid = sessionStorage.getItem(
    //   'currentChatSenderID_' + senderChannnel
    // );
    // //console.log(visitorid);
    // var global_channel = 'global_' + eventID;

    // const dateTime = Date.now();
    // const timestamp = Math.floor(dateTime / 1000);

    // let message = {
    //   Command: 4,
    //   Sender: speakername,
    //   SenderID: speakerid,
    //   TargetId: visitorid,
    //   TargetName: '',
    //   TargetChannel: global_channel,
    //   Message: video_token,
    //   TimeStamp: timestamp,
    //   EventID: eventID,
    //   callRoomID: target_channel,
    // };
    // // console.log(message);
    // var data = JSON.stringify(message);
    // // console.log(data);
    // console.log('sending invite');
    // console.log(isPubNubEnabled);
    // if (isPubNubEnabled == 'false') {
    //   console.log('Calling web socklet');
    //   FireWsSocket(data);
    // } else {
    //   console.log('Calling Pubnub');
    //   pubnub
    //     .publish({ channel: global_channel, message: data })
    //     .then(response => {
    //       //console.log('sendInvite Response status:' + response);
    //       setMessage('');
    //     })
    //     .catch(err => {
    //       console.log('ERROR: ' + JSON.stringify(err.status));
    //       console.log('ERROR: ' + err);
    //     });
    // }

    //sendMessage(data,visitorid,global_channel) ;
  }