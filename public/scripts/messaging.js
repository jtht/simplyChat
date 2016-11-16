(function (window) {
  function readCookie(name) {
  	var name = name + "=";
  	var cookies = document.cookie.split(';');
    var cookieVal = '';

    cookies.forEach(function (cookie) {
      while (cookie.startsWith(' ')) {
        cookie = cookie.substring(1, cookie.length);
      }
      if (!cookie.indexOf(name)) cookieVal = cookie.substring(name.length, cookie.length);
    });
    return cookieVal;
  }


  function assembleMsg() {
    var input = document.getElementById('chat-message-input');
    var msg = {
      content: '',
      sessionID: readCookie('sessionID'),
      chatroom: input.dataset.chatroomName,
      chatroom_owner: input.dataset.chatroomOwner,
      newConnection: false
    };
    return msg;
  }

  function addReplyToChat(reply) {
    var msgDisplay = document.getElementById('chat-window');

    var msgLine = document.createElement('div');
    msgLine.classList.add('chat-message-line')
    if (reply.sender !== reply.recipient) {
      msgLine.classList.add('chat-message-recipient');
      var senderTitle = document.createElement('h5');
      senderTitle.classList.add('chat-message-title');
      senderTitle.textContent = reply.sender;
      msgLine.appendChild(senderTitle);
    }

    var msgContent = document.createElement('div');
    msgContent.textContent = reply.content;
    msgLine.appendChild(msgContent);
    msgDisplay.appendChild(msgLine);

    // scrollar niður á nýjasta message
    msgDisplay.scrollTop = msgDisplay.scrollHeight - msgDisplay.clientHeight;
  }

  function activateMessaging(ws) {
    if (ws) ws.close();
    ws = new WebSocket(window.WS_URL);

    ws.onopen = function () {
      console.log('open');
      var msg = assembleMsg();
      msg.newConnection = true;
      ws.send(JSON.stringify(msg));
    }

    ws.onmessage = function (evt) {
      console.log('fékk skilaboð!');
      var reply = JSON.parse(evt.data);
      addReplyToChat(reply);
    }

    var button = document.getElementById('chat-send-message-button');
    var input = document.getElementById('chat-message-input');

    button.addEventListener('click', function (event) {
      event.preventDefault();
      var content = input.value;
      input.value = "";
      msg = assembleMsg();
      msg.content = content;
      ws.send(JSON.stringify(msg));
    });
  }

  window.activateMessaging = activateMessaging;
})(window);
