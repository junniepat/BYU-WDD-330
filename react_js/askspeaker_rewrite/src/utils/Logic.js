import properties from '../properties';

class Logic {
  validateCredentials(username, pswd) {
    var url = properties.BASE_URL + '/api/exhibitors/login';
    //var url = "https://143e69a5-4d21-4bb4-95cc-76819fa342a7.mock.pstmn.io/api/exlogin/"
    var myHeaders = new Headers();
    var token = '';
    myHeaders.append('Content-Type', 'application/json');
    var formData = {
      Username: username,
      password: pswd,
    };
    var raw = JSON.stringify(formData);
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
    };
    var token = fetch(url, requestOptions)
      .then(response => response.json())
      .then(responseJson => {
        return responseJson;
      })
      .catch(err => {
        console.log('ERROR: ' + err);
      });

    return token;
  }
}

export default new Logic();
