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
    var chatroomDialog = document.createElement('div');
    chatroomDialog.classList.add('chatroom-dialog', 'fit-in-dialogs-container');

    var chatroomDialogOwner = document.createElement('div');
    chatroomDialogOwner.classList.add('chatroom-dialog-owner');

    var containerSpan = document.createElement('span');

    var usersIcon = document.createElement('span');
    usersIcon.classList.add('fa', 'fa-users', 'dialog-icon');

    var ownerIcon = document.createElement('span');
    ownerIcon.classList.add('fa', 'fa-times', 'destroy-dialog-icon');
    var rmChatroomDialog = event => chatrooms.removeChild(chatroomDialog);
    ownerIcon.addEventListener('click', rmChatroomDialog);

    var input = document.createElement('input');
    input.classList.add('chatroom-dialog-input');
    input.type = 'text';
    input.placeholder = 'nafn spjallherbergis'
    input.setAttribute('maxlength', '18');

    containerSpan.appendChild(usersIcon);
    // containerSpan.appendChild(title);
    containerSpan.appendChild(input);
    chatroomDialogOwner.appendChild(containerSpan);
    chatroomDialogOwner.appendChild(ownerIcon);
    chatroomDialog.appendChild(chatroomDialogOwner);

    // function sem sendir ajax beiðnir á server með því sem notandi
    // hefur skrifað í input og athugar hvort það sé löglegt nafn á
    // spjallherbergi. Ef svo er þá verður button virkur og hægt er
    // að búa til nýtt herbergi. function-ið býður í WAIT_TIME sekúndur
    // eftir að notandi hættir að skrifa áður en hann sendir beiðni.
    //
    // var timeoutID;
    // input.addEventListener('input', function () {
    //   button.disabled = true;
    //   var value = input.value;
    //   if (value.length < 3) return;
    //
    //   input.dataset.chatroomName = value;
    //   clearTimeout(timeoutID);
    //   timeoutID = setTimeout(function () {
    //     var payload = {
    //       newChatroomname: value,
    //       makeNewChatroom: false
    //     };
    //     window.makeRequest(window.HTTP_URL, payload, function (response) {
    //       var status = response.status;
    //       var name = response.name;
    //
    //       if (status === 'error') {
    //         window.location.replace(window.HTTP_URL);
    //       } else if (status === "name in use") {
    //         console.log('nafn er ekki í lagi');
    //       } else if (status === "name ok") {
    //         console.log('nafn er í lagi');
    //         button.disabled = false;
    //         console.log(input);
    //       } else {
    //         console.log("Eitthvað hefur farið úrskeiðis");
    //       }
    //     });
    //   }, WAIT_TIME);
    // });
    var errorDiv;
    input.addEventListener('keydown', function (event) {
      if (event.keyCode !== 13) return;
      var payload = {
        newChatroomname: input.value,
      };
      window.makeRequest(HTTP_URL, payload, function (response) {
        if (errorDiv) errorDiv.remove();
        var status = response.status;
        if (status) {
          errorDiv = document.createElement('div');
          errorDiv.textContent = status;
          chatroomDialog.appendChild(errorDiv);
        } else {
          input.remove();
          var name = response.name;
          chatroomDialog.dataset.name = name;
          chatroomDialog.dataset.owner = response.owner;

          ownerIcon.classList.remove('fa-times', 'destroy-dialog-icon');
          ownerIcon.classList.add('fa-black-tie');
          ownerIcon.removeEventListener('click', rmChatroomDialog);

          var title = document.createElement('span');
          title.classList.add('chatroom-dialog-title');
          title.textContent = name;

          containerSpan.appendChild(title);
          chatroomDialog.addEventListener('click', handleCrDialogClick);
        }
      });
    });

    chatrooms.insertBefore(chatroomDialog, chatrooms.lastChild);
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

    document.body.onclick = function (event) {
      var menu = document.querySelector('.chat-options-menu');
      if (!menu) return;
      if (event.target === menu) menu.style.display = 'none';
    }

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
