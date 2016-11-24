(function (window) {
  var remoteDOMAIN = 'desolate-citadel-11212.herokuapp.com/';
  var remoteHTTP = 'https://' + remoteDOMAIN;
  var remoteWS = 'wss://' + remoteDOMAIN;

  var localDomain = 'localhost:3000';
  var localHTTP = 'http://' + localDomain;
  var localWS = 'ws://' + localDomain;

  window.HTTP_URL = localHTTP;
  window.WS_URL = localWS;

  function makeRequest(url, payload, handleResponse) {
    var request = new XMLHttpRequest();
    request.onload = function () {
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

  window.makeRequest = makeRequest;
})(window);
