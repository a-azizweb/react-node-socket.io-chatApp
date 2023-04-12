import React, { useState, useEffect } from "react";
import activeUser from "../components/activeUser.png";

import axios from "axios";

const RoomChatBar = () => {
  return (
    <div className="chat__sidebar">
      <h2>Open Chat</h2>

      {/* All Rooms */}

      <div>
        <h4 className="chat__header">Rooms</h4>
        <div className="chat__room">
          <>
            <p>Name of Room</p>
          </>
        </div>
      </div>

      {/* All Users */}
      <div>
        <h4 className="chat__header">ACTIVE USERS</h4>
        <div className="chat__users">
          <>
            <p>Users i a room</p>
          </>
        </div>
      </div>
    </div>
  );
};

export default RoomChatBar;

/* 


*/
