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
    $or: [{ to: socket.userID }, { from: socket.userID }],
  }).sort({ time: 1 });
  socket.emit("backup messages", messages);
  await MessageModel.updateMany({ offline: true }, { $unset: { offline: 1 } });

  socket.on("private message", async ({ product, from, to, to_uid, text }) => {
    const data = {
      product, // id
      from, // userID
      to_uid, // userID
      text,
      time: new Date(),
    };
    await MessageModel.create({ ...data, to: to_uid });
    socket.to(to).emit("private message", data);
    // socket.to(to).to(socket.userID).emit("private message", data);
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
