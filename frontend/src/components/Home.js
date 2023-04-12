import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
const Home = ({ socket }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("userName", userName);
    // console.log("this is the room user want to join!", room);
    //send the username and socketId to the node js server
    socket.emit("newUser", { userName, userId, socketID: socket.id });
    navigate("/chat");
  };

  useEffect(() => {
    // POST request using fetch inside useEffect React hook
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Ahmad Aziz",
        body: "Message from Ahmad Aziz",
        registrationToken: process.env.REACT_APP_REGISTRATION_TOKEN,
      }),
    };
    fetch("http://localhost:4000/api/v1/firebase/notification", requestOptions)
      .then((response) => response.json())
      .then((data) => console.log(data));

    // empty dependency array means this effect will only run once (like componentDidMount in classes)
  }, []);

  return (
    <form className="home__container" onSubmit={handleSubmit}>
      <h2 className="home__header">Open Chat</h2>
      <label htmlFor="username">Username</label>

      <input
        type="text"
        minLength={6}
        name="username"
        id="username"
        className="username__input"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        required
      />

      <label htmlFor="userID">userID</label>

      <input
        type="number"
        name="userID"
        id="userID"
        className="username__input"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        required
      />

      {/* <label htmlFor="rooms">Rooms</label>

      <Select
        defaultValue={room}
        value={room}
        onChange={setRoom}
        options={options}
        className="username__input"
        required
      /> */}

      <button className="home__cta">SignIn</button>
    </form>
  );
};

export default Home;
