import socketIO from "socket.io-client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import ChatPage from "./components/ChatPage";

import { useEffect } from "react";

//creating connection to the socket.io

function App() {
  const socket = socketIO.connect("http://localhost:4000");

  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<Home socket={socket} />}></Route>
          <Route path="/chat" element={<ChatPage socket={socket} />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
