const express = require("express");
const app = express();
const PORT = 4000;
const mysql2 = require("mysql2");
var bodyParser = require("body-parser");
const crypto = require("crypto");
// const webpush = require("web-push");
// const { admin } = require("./firebaseConfig");
const http = require("http").Server(app);
const cors = require("cors");
// const { userJoin } = require("./utils/users");
//firebase configuration

const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json");
const { userJoin, getRoomUsers, userLeave } = require("./utils/users");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//cors is used to allow different origin to communicate to the server
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require("dotenv").config();
//database connection

const conn = mysql2.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
});

conn.connect(function (err) {
  if (err) throw err;

  console.log("database connected successfully");
});

//connecting to client side
const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

//users array
let users;
let userExist;
let messages;

//online users

let onlineUsers = [];

const algo = process.env.algo;
const inVec = process.env.inVec;
const securityKey = process.env.securityKey;

//Encryption and decryption using single key(symmetric key cryptography)

// function encrypt(text) {
//   const cipher = crypto.createCipheriv(algo, securityKey, inVec);
//   let encrypted = cipher.update(text, "utf8", "hex");
//   encrypted += cipher.final("hex");
//   return encrypted;
// }

//Decryption

// function decrypt(encrypted) {
//   const decipher = crypto.createDecipheriv(algo, securityKey, inVec);
//   let decrypted = decipher.update(encrypted, "hex", "utf8");
//   decrypted += decipher.final("utf8");
//   return decrypted;
// }

const getAllUsers = async () => {
  try {
    const result = await new Promise((resolve, reject) => {
      conn.query(`CALL getAllUsers()`, (err, result) => {
        if (err) {
          ``;
          reject("Failed to fetch data");
          console.log(err);
        } else {
          resolve(result[0]);
          users = result[0];
        }
      });
    });

    return result;
  } catch (error) {
    console.error(error);
  }
};

const getUserByName = async (userName) => {
  try {
    const result = await new Promise((resolve, reject) => {
      conn.query(
        `CALL getUserByName(${JSON.stringify(userName)})`,
        (err, result) => {
          if (err) {
            reject("Failed to fetch data");
            console.log(err);
          } else {
            resolve(result[0]);
            users = result[0];
          }
        }
      );
    });

    return result;
  } catch (error) {
    console.error(error);
  }
};

/* socket code starts here */

//Add this before the app.get() block
socketIO.on("connection", (socket) => {
  //recovering socket io state
  // if (socket.recovered) {
  //   console.log("socket connection recovered:", socket.id);
  // }

  //listen when a new user joins the server

  socket.on("newUser", async (data) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    //1-- get user from db
    await getAllUsers();

    //  userName, userId, socketID: socket.id
    // console.log(data);
    // console.log("this is the room user want to join !", data.room.value);

    //keeping record of users joining specific room
    // const user = userJoin(data.userName, data.userId, data.room.value);
    // console.log("these are credentials of user !", user);

    //updating online users

    if (!onlineUsers.some((user) => user.userId === data.userId)) {
      onlineUsers.push({ userId: data.userId, socketId: socket.id });

      console.log("these are online users:", onlineUsers);
    }

    //sending hashed id of online users to client side
    const secret = "hashed userID";

    const usersId = onlineUsers.map((user) => user.userId);

    const hashedUsersId = usersId.map((item) =>
      crypto.createHash("sha256", secret).update(item).digest("hex")
    );

    console.log("array of hashed ids of online users", hashedUsersId);

    socketIO.emit("getonlineusers", hashedUsersId);
    //online users logic ends here

    const hashedUserId = crypto
      .createHash("sha256", secret)
      .update(data.userId)
      .digest("hex");

    //2-- check if the userId is already registered in DB or not
    // console.log(users);

    userExist = users.filter((user) => hashedUserId === user.userID);
    // console.log("this is user exist array", userExist);

    //3-- if not registered insert into db

    if (userExist.length === 0) {
      //insert user into db

      const id = Math.floor(Math.random() * 100);

      conn.query(
        `CALL newUser(${id},${JSON.stringify(hashedUserId)},${JSON.stringify(
          data.userName
        )})`,
        async (err, data) => {
          if (err) {
            throw err;
          } else {
            // console.log(data);
            const newUsers = await getAllUsers();
            users.push(newUsers);
          }
        }
      );

      socketIO.emit("newUserResponse", users);
    } else {
      socketIO.emit("newUserResponse", users);
    }
  });

  //Events Related to Room Chat
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    //maintain users array

    //joining room
    socket.join(user.room);

    //listening for messages in room
    socket.on("roomMessage", (data) => {
      socketIO.to(user.room).emit("roomMessageResponse", user.room);
    });

    const usersArray = getRoomUsers(user.room);
    console.log("these are users in a room", usersArray);

    socketIO.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //send message to all users on the server

  // socket.on("message", (data) => {
  //   socketIO.emit("messageResponse", data);
  // });

  //listening to typing event and sending the response again to all users
  socket.on("typing", (data) => {
    // console.log(data);
    socket.broadcast.emit("typingResponse", data);
  });

  //disconnecting user
  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");

    //updating users in room array
    const user = userLeave(socket.id);

    if (user) {
      socketIO.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }

    //updating online users array

    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    // socketIO.emit("getonlineusers", onlineUsers);

    const secret = "hashed userID";

    const usersId = onlineUsers.map((user) => user.userId);

    const hashedUsersId = usersId.map((item) =>
      crypto.createHash("sha256", secret).update(item).digest("hex")
    );

    console.log("array of hashed ids of online users", hashedUsersId);

    socketIO.emit("getonlineusers", hashedUsersId);

    console.log("user disconnected , remaining users", onlineUsers);

    //send the list of users to the client

    socketIO.emit("newUserResponse", users);
    socket.disconnect();
  });
});

//APIs

// 1- get all user
app.get("/api/v1/getUsers", async (req, res) => {
  const users = await getAllUsers();

  res.json({
    users: users,
  });
});

app.get("/", (req, res) => {
  res.send("what is data here");
});

// 2- message from user api
app.post("/api/v1/messages", async (req, res) => {
  const userName = req.body.userName;
  const message = req.body.message;
  const room = req.body.room;

  console.log("this is the room of user", room);

  console.log("message from server:", message);

  // const encryptedMessage = encrypt(message);

  // console.log("this is encrypted Messaeg", encryptedMessage);

  //1-- getting online users
  console.log("these are online users", onlineUsers);

  //2--  when the user is present in onlineUsers array store the message in db
  // find user based on name , get the id of that user , if matched with onlineUsers then we will store msg into db

  //getting user by name
  const usersMatched = await getUserByName(userName);
  // console.log("user matched by name", usersMatched);

  //getting id of all online users
  const newArr = onlineUsers.map((user) => user.userId);

  //hashed array of online users ids
  const secret = "hashed userID";
  const hashedArr = newArr.map((item) =>
    crypto.createHash("sha256", secret).update(item).digest("hex")
  );

  console.log("array of hashed ids of online users", hashedArr);

  //get specific user based on id

  const specificUser = usersMatched.find((item) =>
    hashedArr.includes(item.userID)
  );

  // console.log("this is specific user: ", specificUser);

  console.log("these are online users:", onlineUsers);

  //3--  when the user is not present in the array send the message in response to message event

  // store the encrypted message in the db

  //dont store message in db (send the message directly)

  if (onlineUsers.length < 2) {
    const sql = `INSERT INTO messages (userName,message,room) VALUES (${JSON.stringify(
      userName
    )},${JSON.stringify(message)},${JSON.stringify(room)})`;

    conn.query(sql, (err, data) => {
      if (err) {
        throw err;
      } else {
        console.log("this is the message of user", data[0]);
      }
    });

    res.json({
      userName: userName,
      message: message,
    });
  } else {
    const data = { userName: userName, message: message };
    console.log("this is data from client side", data);

    socketIO.to(room).emit("messageResponseOnline", data);

    // socketIO.emit("messageResponseOnline", data);

    res.json({
      userName: userName,
      message: message,
    });
  }
});

// getting all messages
const getAllMessages = async () => {
  try {
    const result = await new Promise((resolve, reject) => {
      conn.query(`CALL getAllMessages()`, (err, result) => {
        if (err) {
          reject("Failed to fetch data");
          console.log(err);
        } else {
          resolve(result[0]);
        }
      });
    });

    return result;
  } catch (error) {
    console.error(error);
  }
};

// 3- get all messages api
app.get("/api/v1/getAllMessages", async (req, res) => {
  const message = await getAllMessages();

  // console.log(message);

  // message.forEach((msg) => {
  //   const encryptedMsg = msg.message;
  //   const decryptedMsg = decrypt(encryptedMsg);

  //   msg.message = decryptedMsg;
  // });

  res.json({
    message: message,
  });
});

// 4- firebase push notification api
app.post("api/v1//firebase/notification", (req, res) => {
  const registrationToken = req.body.registrationToken;

  const payload = {
    notification: {
      title: req.body.title,
      body: req.body.body,
      click_action: "FCM_PLUGIN_ACTIVITY",
    },
  };

  const options = {
    priority: "high",
    timeToLive: 60 * 60 * 24,
  };

  //sending notification
  admin
    .messaging()
    .sendToDevice(registrationToken, payload, options)
    .then((response) => {
      res.status(200).send("Notification Sent Successfully.");
      console.log("this is the response of notification", response);
    })
    .catch((error) => {
      console.log(error);
    });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

/*





*/
