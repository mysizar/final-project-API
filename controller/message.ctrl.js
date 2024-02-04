import { io } from "../index.js";
import { sessionStore } from "../middlewares/message/checkSession.mdw.js";
import { MessageModel } from "../models/message.model.js";
import { SocketModel } from "../models/socket.model.js";

let users = [];
export default async function socketListener(socket) {
  console.log("user connected:", socket.userID);

  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
    username: socket.username,
  });

  users.push({
    userID: socket.userID,
    username: socket.username,
    socketID: socket.id,
  });
  io.emit("users", users);

  // backup messages
  const messages = await MessageModel.find({
    $or: [{ to_uid: socket.userID }, { from: socket.userID }],
  }).sort({ time: 1 });
  socket.emit("backup messages", messages);

  socket.on("session update", async (data) => {
    const oldUserID = socket.userID;
    // socket
    socket.sessionID = data.sessionID;
    socket.userID = data.userID;
    socket.username = data.username;
    // sessionStore
    sessionStore.saveSession(data.sessionID, {
      userID: data.userID,
      username: data.username,
    });
    // update messages in Database
    await MessageModel.updateMany(
      { to_uid: oldUserID },
      { to_uid: data.userID }
    );
    await MessageModel.updateMany({ from: oldUserID }, { from: data.userID });
    // update session in Database
    await SocketModel.findOneAndUpdate(
      { sessionID: data.sessionID },
      {
        sessionID: data.sessionID,
        userID: data.userID,
        username: data.username,
      },
      { upsert: true }
    );
    // send to frontend
    socket.emit("session", {
      sessionID: data.sessionID,
      userID: data.userID,
      username: data.username,
    });
    // update users
    users = users.map((i) =>
      i.userID !== oldUserID
        ? i
        : {
            userID: data.userID,
            username: data.username,
            socketID: socket.id,
          }
    );
    io.emit("users", users);
    // update messages
    const messages = await MessageModel.find({
      $or: [{ to_uid: socket.userID }, { from: socket.userID }],
    }).sort({ time: 1 });
    socket.emit("backup messages", messages);
  });

  socket.on("new messages read", async (msgsToUpdate) => {
    await MessageModel.updateMany(msgsToUpdate, { $unset: { notRead: 1 } });
  });

  socket.on("private message", async ({ product, from, to, to_uid, text }) => {
    const data = {
      product, // id
      from, // userID
      to_uid, // userID
      text,
      time: new Date(),
      notRead: true,
    };
    await MessageModel.create(data);
    socket.to(to).emit("private message", data);
  });

  socket.on("disconnect", async () => {
    console.log("user disconnected:", socket.userID);
    users = users.filter((user) => user.userID !== socket.userID);
    io.emit("users", users);
    sessionStore.saveSession(socket.sessionID, {
      userID: socket.userID,
      username: socket.username,
    });
    // backup
    await SocketModel.findOneAndUpdate(
      { sessionID: socket.sessionID },
      {
        sessionID: socket.sessionID,
        userID: socket.userID,
        username: socket.username,
      },
      { upsert: true }
    );
  });
}
