/**
 * Höndlar þegar notandi skráir sig út
 */

(function () {
  var logout = document.getElementById('logout-anchor');

  logout.addEventListener('click', function (event) {
    event.preventDefault();
    window.location.replace(window.HTTP_URL + '?logout=true');
  });
})();
