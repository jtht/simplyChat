(function (window) {
  var LOCAL = 'local';
  var REMOTE = 'remote';

  function setHost(loc) {
    var REMOTE_DOMAIN = 'desolate-citadel-11212.herokuapp.com/';
    var REMOTE_HTTP = 'https://' + REMOTE_DOMAIN;
    var REMOTE_WS = 'wss://' + REMOTE_DOMAIN;

    var LOCAL_DOMAIN = 'localhost:3000';
    var LOCAL_HTTP = 'http://' + LOCAL_DOMAIN;
    var LOCAL_WS = 'ws://' + LOCAL_DOMAIN;

    window.HTTP_URL = REMOTE_HTTP //loc === LOCAL ? LOCAL_HTTP : REMOTE_HTTP;
    window.WS_URL = REMOTE_WS // loc === LOCAL ? LOCAL_WS : LOCAL_WS;
  }

  function makeRequest(url, payload, handleResponse) {
    var request = new XMLHttpRequest();
    request.onload = function() {
      if (request.status === 200) {
        var response = JSON.parse(request.responseText);
        handleResponse(response);
      } else {
        console.log('tengingar villa: ' + request.status);
      }
    }
    request.open('POST', url);
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    request.send(JSON.stringify(payload));
  }

  setHost(REMOTE);
  window.makeRequest = makeRequest;
})(window);
