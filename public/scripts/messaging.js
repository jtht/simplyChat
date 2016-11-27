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
      newConnection: false,
      date: Date.now()
    };
    return msg;
  }

  function addReplyToChat(reply) {
    var msgDisplay = document.getElementById('chat-window');

    var msgLineContainer = document.createElement('div');
    msgLineContainer.classList.add('chat-message-line-container')

    var msgLine = document.createElement('div');
    msgLine.classList.add('chat-message-line')
    msgLine.dataset.sender = reply.sender;
    msgLine.dataset.date = reply.date;
    if (reply.sender !== reply.recipient) {
      msgLineContainer.classList.add('not-sender');
    }

    var msgContentContainer = document.createElement('div');
    msgContentContainer.classList.add('message-content-container');

    var msgContent = document.createElement('div');
    msgContent.classList.add('chat-message-content');
    msgContent.textContent = reply.content;

    msgContentContainer.appendChild(msgContent);
    msgLine.appendChild(msgContentContainer);

    var lastMsgContainer = msgDisplay.lastChild;
    var delta, isSameSender;
    if (lastMsgContainer) {
      lastMsg = lastMsgContainer.lastChild;
      delta = parseInt(reply.date) - parseInt(lastMsg.dataset.date);
      isSameSender = lastMsg.dataset.sender === reply.sender;
    }

    if (delta <= 10000 && isSameSender) {
      msgLine.classList.add('no-avatar');
      lastMsgContainer.appendChild(msgLine);
    } else {
      var avatarContainer = document.createElement('div');
      avatarContainer.classList.add('avatar-container');
      avatarContainer.style.background = 'url("' + reply.gravatar + '")';

      var titleContainer = document.createElement('div');
      titleContainer.classList.add('message-title-container');

      var senderTitle = document.createElement('span');
      senderTitle.classList.add('chat-message-title');
      senderTitle.textContent = reply.sender;

      var msgDate = document.createElement('span');
      msgDate.classList.add('chat-message-date');
      msgDate.textContent = (new Date(parseInt(reply.date))).toTimeString().substring(0, 5);

      titleContainer.appendChild(senderTitle);
      titleContainer.appendChild(msgDate);
      msgContentContainer.insertBefore(titleContainer, msgContent);
      msgLine.insertBefore(avatarContainer, msgContentContainer);
      msgLineContainer.appendChild(msgLine);
      msgDisplay.appendChild(msgLineContainer);
    }

    // scrollar niður á nýjasta message
    msgDisplay.scrollTop = msgDisplay.scrollHeight - msgDisplay.clientHeight;
  }

  function activateMessaging(ws) {
    if (ws) ws.close();
    ws = new WebSocket(window.WS_URL);

    ws.onopen = function () {
      var msg = assembleMsg();
      msg.newConnection = true;
      ws.send(JSON.stringify(msg));
    }

    ws.onmessage = function (evt) {
      var reply = JSON.parse(evt.data);
      addReplyToChat(reply);
    }

    var input = document.getElementById('chat-message-input');
    input.addEventListener('keydown', function (event) {
      if (event.keyCode !== 13) return;
      event.preventDefault();
      var content = input.value;
      input.value = "";
      msg = assembleMsg();
      msg.content = content;
      ws.send(JSON.stringify(msg));
    })
  }

  window.activateMessaging = activateMessaging;
})(window);
