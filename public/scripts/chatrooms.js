//
(function () {
  var WAIT_TIME = 800;

  var chatrooms = document.getElementById('chatroom-dialogs-container');
  var addCrDialogButton = document.getElementById('add-chatroom-dialog');
  var chatContainer = document.getElementById('chat-container');

  addCrDialogButton.addEventListener('click', function (event) {
    createChatroomDialog();
  });

  function createChatroomDialog(input) {
    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'nafn spjallherbergis'
    input.setAttribute('maxlength', '18');

    var button = document.createElement('button');
    button.textContent = 'con';
    button.disabled = true;

    var chatroom = document.createElement('div');
    chatroom.classList.add('chatroom-dialog');

    var timeoutID;
    input.addEventListener('input', function () {
      button.disabled = true;
      var value = input.value;
      if (value.length < 3) return;

      input.dataset.chatroomName = value;
      clearTimeout(timeoutID);
      timeoutID = setTimeout(function () {
        var payload = {
          newChatroomname: value,
          makeNewChatroom: false
        };
        window.makeRequest(window.HTTP_URL, payload, function (response) {
          var status = response.status;
          var name = response.name;

          if (status === 'error') {
            window.location.replace(window.HTTP_URL);
          } else if (status === "name in use") {
            console.log('nafn er ekki í lagi');
          } else if (status === "name ok") {
            console.log('nafn er í lagi');
            button.disabled = false;
            console.log(input);
          } else {
            console.log("Eitthvað hefur farið úrskeiðis");
          }
        });
      }, WAIT_TIME);
    });

    button.addEventListener('click', function () {
      input.disabled = true;
      button.disabled = true;
      var payload = {
        newChatroomname: input.value,
        makeNewChatroom: true
      };
      window.makeRequest(HTTP_URL, payload, function (response) {
        var name = response.name;
        var owner = response.owner;
        input.remove();
        button.remove();
        chatroom.dataset.name = name;
        chatroom.dataset.owner = owner;
        chatroom.classList.add('chatroom-dialog-owner');

        var span = document.createElement('div');
        span.textContent = name;
        span.classList.add('chatroom-dialog-title')
        chatroom.appendChild(span);
        chatroom.addEventListener('click', handleCrDialogClick);
      });
    });

    chatroom.appendChild(input);
    chatroom.appendChild(button);
    chatrooms.appendChild(chatroom);
    input.focus();
  }

  var ws;
  function handleCrDialogClick(event) {
    var chatroom = event.currentTarget;
    deleteChatroom();
    createChatroom(chatroom.dataset);
    window.activateMessaging(ws);
  }

  function createChatroom(chatroom) {
    console.log(chatroom.owner);

    var chatWindowContainer = document.createElement('div');
    chatWindowContainer.classList.add('chat-window-container');

    var chatTitleContainer = document.createElement('div');
    chatTitleContainer.classList.add('chat-title-container');

    var crName = chatroom.name;
    var chatTitle = document.createElement('div');
    chatTitle.classList.add('chat-title');
    chatTitle.textContent = crName;

    var chatOptionsMenu = createOptionsMenu(chatroom);
    var optionAddUser = document.createElement('button');
    optionAddUser.classList.add('option-add-user', 'round-button');
    optionAddUser.addEventListener('click', function () {
      if (chatOptionsMenu.style.display === 'none') {
        chatOptionsMenu.style.display = 'block';
      } else {
        chatOptionsMenu.style.display = 'none';
      }
    });

    var chatOptions = document.createElement('div');
    chatOptions.classList.add('chat-options-container');

    var chatWindow = document.createElement('div');
    chatWindow.classList.add('chat-window');
    chatWindow.id = 'chat-window';

    var input = document.createElement('textarea');
    input.id = 'chat-message-input';
    input.classList.add('chat-message-input');
    input.placeholder = 'Skrifaðu skilboð hér...';
    input.dataset.chatroomName = crName;
    input.dataset.chatroomOwner = chatroom.owner;

    chatOptions.appendChild(optionAddUser);
    chatTitleContainer.appendChild(chatTitle);
    chatTitleContainer.appendChild(chatOptions);
    chatTitleContainer.appendChild(chatOptionsMenu);
    chatWindowContainer.appendChild(chatTitleContainer);
    chatWindowContainer.appendChild(chatWindow);
    chatWindowContainer.appendChild(input);
    chatContainer.appendChild(chatWindowContainer);

    input.focus();
  }

  function createOptionsMenu(chatroom) {
    console.log(chatroom.name);
    var menu = document.createElement('div');
    menu.classList.add('chat-options-menu');

    var info = document.createElement('div');
    info.textContent = 'bættu við notanda';
    info.classList.add('chat-options-info');

    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'nafn/email notanda';
    input.setAttribute('maxlength', '18');

    var buttonDiv = document.createElement('div');
    var button = document.createElement('button');
    button.textContent = 'senda';
    button.addEventListener('click', function () {
      var payload = {
        chatroom: chatroom.name,
        owner: chatroom.owner,
        user: input.value
      }

      window.makeRequest(HTTP_URL, payload, function (response) {
        var status = response.status;
        var OK = "notanda bætt við";

        info.textContent = status;
        info.classList.add(status === OK ? 'success' : 'error');
      });
    });

    buttonDiv.appendChild(button);
    menu.appendChild(info);
    menu.appendChild(input);
    menu.appendChild(buttonDiv);
    menu.style.display = 'none';
    return menu;
  }

  function deleteChatroom() {
    var chatWindowContainer = document.querySelector('.chat-window-container');
    if (chatWindowContainer) chatContainer.removeChild(chatWindowContainer);
  }

  chatrooms.querySelectorAll('.chatroom-dialog').forEach(function (div) {
    div.addEventListener('click', handleCrDialogClick);
  });
})();
