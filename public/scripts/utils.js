(function (window) {
  function makeRequest(url, payload, handleResponse) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.responseText);
          handleResponse(response);
        } else {
          console.log('tengingar villa: ' + request.status);
        }
      }
    }
    request.open('POST', url);
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    request.send(JSON.stringify(payload));
  }

  var domainName = 'desolate-citadel-11212.herokuapp.com/';
  window.HTTP_URL = 'http://' + domainName;
  window.WS_URL = 'ws://' + domainName;
  window.makeRequest = makeRequest;
})(window);
