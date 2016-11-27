DROP DATABASE IF EXISTS puppies;
CREATE DATABASE puppies;

\c puppies;

CREATE TABLE chatuser (
    name VARCHAR PRIMARY KEY,
    email VARCHAR,
    passwordHash VARCHAR,
    sessionID VARCHAR,
    gravatar VARCHAR default 'https://s.gravatar.com/avatar/?s=100&r=x&d=retro'
);

CREATE TABLE chatroom (
    name VARCHAR,
    owner VARCHAR,
    PRIMARY KEY (name, owner),
    FOREIGN KEY (owner) REFERENCES chatuser (name)
);

CREATE TABLE chatmessage (
    content VARCHAR,
    sender VARCHAR,
    chatroom VARCHAR,
    chatroom_owner VARCHAR,
    date_of_send VARCHAR,
    FOREIGN KEY (sender) REFERENCES chatuser (name),
    FOREIGN KEY(chatroom, chatroom_owner) REFERENCES chatroom (name, owner)
);

CREATE TABLE chatuserchatroom (
    chatuser VARCHAR,
    chatroom VARCHAR,
    chatroom_owner VARCHAR,
    PRIMARY KEY (chatuser, chatroom, chatroom_owner),
    FOREIGN KEY (chatuser) REFERENCES chatuser (name),
    FOREIGN KEY (chatroom, chatroom_owner) REFERENCES chatroom (name, owner)
);
