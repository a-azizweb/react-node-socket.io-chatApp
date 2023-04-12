import axios from "axios";
import React, { useEffect, useState } from "react";
import { JSEncrypt } from "jsencrypt";
const ChatFooter = ({ socket }) => {
  const [message, setMessage] = useState();

  //encryption using rsa

  // let encrypt = new JSEncrypt();

  let publicKey = `MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDlOJu6TyygqxfWT7eLtGDwajtN
  FOb9I5XRb6khyfD1Yt3YiCgQWMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76
  xFxdU6jE0NQ+Z+zEdhUTooNRaY5nZiu5PgDB0ED/ZKBUSLKL7eibMxZtMlUDHjm4
  gwQco1KRMDSmXSMkDwIDAQAB`;

  //rsa decryption ends here

  const handleTyping = () => {
    socket.emit("typing", `${localStorage.getItem("userName")} is typing`);
  };

  //message submit handler

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const userName = localStorage.getItem("userName");
    const messages = message;

    //sending message to server

    //1-- post api to post form data   then store the data in the db

    if (message.trim() && localStorage.getItem("userName")) {
      //1-- getting data from db

      //2-- emit data in response of message event

      socket.emit("message", {
        text: messages,
        name: userName,
      });
    }

    setMessage("");

    //encrypting message

    let encrypt = new JSEncrypt();

    // //assign our encryptor to utilize the public key
    encrypt.setPublicKey(publicKey);

    // //perform encryption based on our public key -- only private key can read it

    let encrypted = encrypt.encrypt(message);

    // console.log("this is encrypted message:", encrypted);

    const room = localStorage.getItem("room");
    await axios.post("http://localhost:4000/api/v1/messages", {
      userName: userName,
      // message: message,
      message: encrypted,
      room: room,
    });

    //emitting message to the room
  };

  return (
    <div className="chat__footer">
      <form className="form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Write message"
          className="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleTyping}
        />
        <button className="sendBtn">SEND</button>
      </form>
    </div>
  );
};

export default ChatFooter;

/*
  
implementation of rsa :

1-- encrypt message on client side and send to the server 

2-- server will store(if) and send back the encrypted message to the client side

3-- the client will decrypt the message and show on screen


issue:

the message is saved in encrypted form in the db so we have to decrypt the message:->




*/
