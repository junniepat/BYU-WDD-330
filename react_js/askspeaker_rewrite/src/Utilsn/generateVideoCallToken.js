import getCookie from './getCookies';

export default function generateVideoCallToken(channelName) {
    var evetoken = getCookie('eveStgMgmt_UserTkn');
    var videotoken = '';
    var url =
    //   properties.BASE_URL + '/api/videomeeting/' + eventID + '/createmeeting?ChannelId=' +
      channelName;
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    var requestOptions = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + evetoken,
      },
    };
    videotoken = fetch(url, requestOptions)
      .then(response => {
        var res = response.json();
        //console.log(res);
        //console.log('Token response: ' + res.status);
        //console.log('Token response: ' + res.token);
        return res;
      })
      .catch(err => {
        console.log('ERROR: ' + err);
        console.log('ERROR: ' + JSON.stringify(err.status));
      });
    return videotoken;
  }
