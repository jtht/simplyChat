(function () {
  function setListeners(button, form) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      clickHandler(form);
    });
  }

  var signupButton = document.getElementById('signupSubmit');
  var signupForm = document.getElementById('signup');
  setListeners(signupButton, signupForm);

  var loginButton = document.getElementById('loginSubmit');
  var loginForm = document.getElementById('login');
  setListeners(loginButton, loginForm);

  function clickHandler(form) {
    var payload = {};
    payload['type'] = form.id;
    ([].slice.apply(form)).forEach(function(input) {
      if (input.name) payload[input.name] = input.value;
    });
    handleResponse.form = form;
    window.makeRequest(HTTP_URL, payload, handleResponse);
  }

  function handleResponse(response) {
    var errorOccured = false;
    var form = handleResponse.form;

    Object.keys(response).forEach(function(key) {
      var error = response[key];
      var input = form.querySelector('[name="' + key + '"]');
      var parent = input.parentElement;

      cleanUp(parent);
      parent.classList.add('has-feedback');
      var span = document.createElement('span');
      span.classList.add('glyphicon','form-control-feedback');
      parent.appendChild(span);
      if (error) {
        errorOccured = true;
        parent.classList.remove('has-success');
        parent.classList.add('has-error');
        span.classList.add('glyphicon-remove');

        var label = document.createElement('label');
        label.classList.add('control-label')
        label.textContent = error;
        parent.insertBefore(label, parent.firstChild);
      } else {
        parent.classList.remove('has-error');
        parent.classList.add('has-success');
        span.classList.add('glyphicon-ok');
      }
    });

    if (!errorOccured) window.location.replace(HTTP_URL);
  }

  function cleanUp(parent) {
    var span = parent.querySelector('span');
    var label = parent.querySelector('label');

    if (span) parent.removeChild(span);
    if (label) parent.removeChild(label);
  }
})();
