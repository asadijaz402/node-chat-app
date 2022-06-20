const path = require("path");
const http = require("http");
const express = require("express");
const { generateMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getRoomUsers } = require("./utils/user");
const app = express();
const socketio = require("socket.io");
const port = process.evn?.PORT || 3000;
const server = http.createServer(app);
const io = socketio(server);
const Filter = require("bad-words");

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("new webSocket connection");

  socket.on("join", ({ username, room }, callBack) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callBack(error);
    }
    socket.join(user.room);
    socket.emit("message", generateMessage("Wellcome!", "admin"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(`${user.username} has joined!`, "admin")
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
    callBack();
  });
  socket.on("sendMessage", (message, callBack) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callBack("Profanity is not allowed!");
    }
    io.to(user?.room).emit("message", generateMessage(message, user.username));
    callBack();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left!`, "admin")
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });

  socket.on("sendLocation", ({ location }, callBack) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationSend",
      generateMessage(
        `https://www.google.com/maps?q=${location.lat},${location.long}`,
        user.username
      )
    );
    callBack("Delivered!");
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
