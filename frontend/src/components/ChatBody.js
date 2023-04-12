import axios from "axios";
import { JSEncrypt } from "jsencrypt";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { messaging } from "./firebase";
import { getToken } from "firebase/messaging";

const ChatBody = ({ lastMessageRef, typingStatus, socket }) => {
  let privateKey = process.env.REACT_APP_PRIVATE_KEY;

  //decrypt message object
  let decrypt = new JSEncrypt();
  decrypt.setPrivateKey(privateKey);
  const navigate = useNavigate();
  // dbMessages, messages,
  const handleLeaveChat = () => {
    localStorage.removeItem("userName");
    navigate("/");
    window.location.reload();
  };

  const [messages, setMessages] = useState([]);
  const [dbMessages, setDbMessages] = useState([]);

  const [allMessages, setAllMessages] = useState([]);

  const [token, setToken] = useState("");
  // console.log("these are messages from db", dbMessages);

  let databaseMsgs;
  // let token;
  //firebase push notification

  //getting permission
  async function requestPermission() {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      //generate token
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_VAPIDKEY,
      });
      setToken(token);
      // console.log("this is device token:", token);
    } else if (permission === "denied") {
      alert("You denied for this notification");
    }
  }

  // console.log("this is device token:", token);

  useEffect(() => {
    requestPermission();
    console.log("this is device token :", token);
  }, [token]);
  const roomName = localStorage.getItem("room");

  useEffect(() => {
    socket.on("messageResponseOnline", (data) => {
      // console.log("this is the response data:", data);

      decrypt.setPrivateKey(privateKey);

      let decryptedMessage = decrypt.decrypt(data.message);

      // console.log("this is decrypted data:", decryptedMessage);

      //firebase push notification

      //sending post request to push notification

      const newData = {
        userName: data.userName,
        message: decryptedMessage,
      };

      // console.log("this is message of data:", newData);

      setMessages([...messages, newData]);
    });

    const timer = setTimeout(async () => {
      const response = await axios.get(
        "http://localhost:4000/api/v1/getallmessages"
      );

      // console.log("this is the message from database", response.data.message);

      databaseMsgs = response.data.message;

      databaseMsgs.forEach((element) => {
        const encryptedMessage = element.message;

        let decryptedMessage = decrypt.decrypt(encryptedMessage);

        element.message = decryptedMessage;

        // console.log("this is decrypred message", decryptedMessage);
      });

      const filteredArray = databaseMsgs.filter((msg) => msg.room === roomName);
      // console.log("this is filtered Array", filteredArray);
      // setDbMessages(databaseMsgs);
      setDbMessages(filteredArray);

      // console.log("this is database message:", databaseMsgs);

      // axios
      //   .get("http://localhost:4000/api/v1/getallmessages")
      //   .then((response) => {
      //     // setUsers(response.data);

      //     databaseMsgs = response.data.message;

      //     // console.log(response.data.message);

      //     // console.log(decryptedMessage);
      //     // return setDbMessages(response.data.message);
      //     return databaseMsgs;
      //   });
      // databaseMsgs.forEach((element) => {
      //   const encryptedMessage = element.message;

      //   let decryptedMessage = decrypt.decrypt(encryptedMessage);
      //   console.log(decryptedMessage);
      // });
    }, 1000);

    setAllMessages([...dbMessages, ...messages]);

    return () => clearTimeout(timer);
  }, [socket, setMessages, dbMessages, messages]);

  return (
    <>
      <header className="chat__mainHeader">
        {/* <p>Hangout with Colleagues</p> */}
        <p>{`Welcome to ${roomName} Room!`}</p>

        <button className="leaveChat__btn" onClick={handleLeaveChat}>
          LEAVE CHAT
        </button>
      </header>

      {/*This shows messages sent from you*/}
      <div className="message__container">
        {allMessages.map((message) =>
          message.userName === localStorage.getItem("userName") ? (
            <div className="message__chats" key={message.id}>
              <p className="sender__name">You</p>
              <div className="message__sender">
                <p>{message.message}</p>
              </div>
            </div>
          ) : (
            <div className="message__chats" key={message.id}>
              <p>{message.userName}</p>
              <div className="message__recipient">
                <p>{message.message}</p>
              </div>
            </div>
          )
        )}

        {/*This is triggered when a user is typing*/}
        {/* <div className="message__status">
            {typingStatus !== null && <p> {typingStatus}</p>}
          </div> */}

        <div ref={lastMessageRef} />
      </div>
    </>
  );
};

export default ChatBody;
