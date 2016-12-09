(function () {
  // Einföld regex, með vankanta, til að finna url í skilaboðum.
  // Finnur url með lögleg domain og top-domain. Path og query þurfa
  // ekki að vera lögleg. Port númmer EKKI leyfð. Athugar
  // top level domain sem hafa eru notuð í meira en 0.1% af
  // öllum vefsíðum og is

  var re = /(?:^|\s)((http(?:s)?:\/\/)?(?:[a-zA-z0-9]+(?:-+[a-zA-z0-9]+)*\.)+(?:is|com|ru|org|net|de|jp|uk|br|it|pl|in|fr|nl|au|ir|info|cn|es|cz|kr|ca|ua|eu|co|gr|za|biz|ro|se|mx|ch|tw|vn|tr|hu|be|at|dk|ar|tv|me|no|sk|us|fi|id|xyz|cl|by|pt|il|ie|io|kz|nz|my|hk|lt|cc|sg|edu|pk|bg|su|hr|pe|lv|rs|az|club|si|ae|ph|pro|ng|ws|top|ee|tk|ve|online|pw)(?:\/(?:\S|$)*)?)(?=$|\s)/g

  function parseLinks(reply) {
    return reply.replace(re, (match, p1, p2) => {
      var link = p2 ? p1 : 'http://' + p1;
      var anchor = '<a href="' + link + '", target="_blank">' + p1 + '</a>';
      if (/[a-zA-Z0-9]/.test(match.substring(0, 1))) {
        return anchor;
      } else {
        return ' ' + anchor;
      }
    });
  }

  window.parseLinks = parseLinks;
})();
