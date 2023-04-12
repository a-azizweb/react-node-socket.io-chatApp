import React, { useState, useEffect } from "react";
import activeUser from "../components/activeUser.png";

import axios from "axios";

const ChatBar = ({ socket, setInRoom }) => {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  //state for rooms
  const [roomUsers, setRoomUsers] = useState([]);
  const [joinRoom, setJoinRoom] = useState(false);
  let newUsers = [];

  const rooms = [
    { id: 1, name: "JavaScript" },
    { id: 2, name: "Python" },
    { id: 3, name: "PHP" },
    { id: 3, name: "Java" },
  ];

  useEffect(() => {
    socket.on("newUserResponse", (data) => {
      localStorage.setItem("users", JSON.stringify(data));
    });

    setLoading(true);

    const timer = setTimeout(() => {
      axios.get("http://localhost:4000/api/v1/getUsers").then((response) => {
        // setUsers(response.data);
        newUsers = response.data.users;
        setUsers(newUsers);
        // console.log(newUsers);
      });
    }, 1000);
    setLoading(false);

    return () => clearTimeout(timer);

    //getting data from api
  }, [setUsers, newUsers]);

  useEffect(() => {
    socket.on("getonlineusers", (data) => {
      setOnlineUsers(data);
    });
  }, [socket]);

  const online = users.filter((item) => onlineUsers.includes(item.userID));

  const offline = users.filter((item) => !onlineUsers.includes(item.userID));

  // console.log(result);

  // console.log("these are online users", online);
  // console.log("these are offline users users", offline);
  // console.log("these are all users", users);
  const activeUserName = localStorage.getItem("userName");

  const handleRoomJoin = (room) => {
    setInRoom(true);
    setJoinRoom(true);
    localStorage.setItem("room", room);
    // console.log("this is name of room", name);
    const username = localStorage.getItem("userName");
    socket.emit("joinRoom", { username, room });
  };

  const room = localStorage.getItem("room");

  // useEffect(() => {

  // }, []);
  socket.on("roomUsers", ({ room, users }) => {
    setRoomUsers(users);
    console.log("these are users inside a room:", roomUsers);
  });

  // console.log("these are users inside a room", roomUsers);

  return (
    <div className="chat__sidebar">
      <h2>Open Chat</h2>

      {/* All Rooms */}
      {!joinRoom && (
        <div>
          <h4 className="chat__header">Rooms</h4>
          <div className="chat__room">
            <>
              {rooms.map((room, index) => (
                <p
                  className="chat__room__p"
                  key={index}
                  onClick={() => handleRoomJoin(room.name)}
                >
                  {room.name}
                </p>
              ))}
            </>
          </div>
        </div>
      )}

      <div>
        <h3 className="chat__header">Users in {room} Room </h3>
        {roomUsers.map((user, index) => (
          <p key={index}>{user.username}</p>
        ))}
      </div>

      {/* All Users */}
      <div>
        <h4 className="chat__header">ALL USERS</h4>
        <div className="chat__users">
          {users.length === 0 ? (
            <>
              <p>Loading...</p>
            </>
          ) : (
            <>
              {users.map((user) => (
                <p key={user.userID}>
                  {user.userName}
                  {onlineUsers.includes(user.userID) && (
                    <img
                      src={activeUser}
                      className="active__user"
                      alt="active"
                    />
                  )}
                </p>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBar;

/* 


*/
