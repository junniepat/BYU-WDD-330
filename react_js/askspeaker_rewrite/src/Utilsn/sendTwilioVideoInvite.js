export default function sendTwilioVideoInvite(target_link) {
    //console.log('Sending invite for eve video call');
    // var visitorid = sessionStorage.getItem(
    //   'currentChatSenderID_' + senderChannnel
    // );
    // //console.log(visitorid);
    // var global_channel = 'global_' + eventID;

    // const dateTime = Date.now();
    // const timestamp = Math.floor(dateTime / 1000);

    // let message = {
    //   Command: 15,
    //   Sender: speakername,
    //   SenderID: speakerid,
    //   TargetId: visitorid,
    //   TargetName: '',
    //   TargetChannel: global_channel,
    //   Message: '',
    //   TimeStamp: timestamp,
    //   EventID: eventID,
    //   callRoomID: target_link,
    // };
    // var data = JSON.stringify(message);
    // console.log(data);
    // if (isPubNubEnabled == 'false') {
    //   console.log('Calling web socklet');
    //   FireWsSocket(data);
    // } else {
    //   pubnub
    //     .publish({ channel: global_channel, message: data })
    //     .then(response => {
    //       //console.log('sendInvite Response status:' + response.status);
    //       setMessage('');
    //     })
    //     .catch(err => {
    //       console.log('ERROR: ' + JSON.stringify(err.status));
    //       console.log('ERROR: ' + err);
    //     });
    // }
    //sendMessage(data,visitorid,global_channel) ;
  }