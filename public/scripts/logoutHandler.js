(function () {
  var URL = 'http://localhost:3000/';
  var logout = document.getElementById('logout-anchor');

  logout.addEventListener('click', function (event) {
    event.preventDefault();
    window.location.replace(URL + '?logout=true');
  });
})();
