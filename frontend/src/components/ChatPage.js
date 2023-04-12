import React, { useEffect, useState, useRef } from "react";
import ChatBar from "./ChatBar";
import ChatBody from "./ChatBody";
import ChatFooter from "./ChatFooter";
import RoomChatBar from "./RoomChatBar";
import { useNavigate } from "react-router-dom";

const ChatPage = ({ socket }) => {
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  const [typingStatus, setTypingStatus] = useState("");

  //state for rooms
  const [inRoom, setInRoom] = useState(false);

  // let allMessages;

  const lastMessageRef = useRef(null);

  //___ adding scroll to last message when the message array changes
  useEffect(() => {
    //scroll to bottom every time message changes
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //___ listening for typingResponse event
  useEffect(() => {
    socket.on("typingResponse", (data) => setTypingStatus(data));
  }, [socket]);

  const handleLeaveChat = () => {
    localStorage.removeItem("userName");
    navigate("/");
    window.location.reload();
  };

  const room = localStorage.getItem("room");
  return (
    <div className="chat">
      <ChatBar socket={socket} setInRoom={setInRoom} />

      {/* <ChatBar socket={socket} setInRoom={setInRoom} /> */}
      <div className="chat__main">
        {inRoom ? (
          <>
            <ChatBody
              lastMessageRef={lastMessageRef}
              typingStatus={typingStatus}
              socket={socket}
            />
            <ChatFooter socket={socket} />
          </>
        ) : (
          <>
            <header className="chat__mainHeader">
              {/* <p>Hangout with Colleagues</p> */}
              {/* <p>{`Welcome to ${roomName} Room!`}</p> */}

              <button className="leaveChat__btn" onClick={handleLeaveChat}>
                LEAVE
              </button>
            </header>
            <h1 className="join__room__msg">Please Join The Room!</h1>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
