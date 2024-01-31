import { randomBytes } from "crypto";
import { SocketModel } from "../../models/socket.model.js";
import InMemorySessionStore from "../../classes/sessionStore.js";

export const sessionStore = new InMemorySessionStore();

export default async function session(socket, next) {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    // recover sessions from DB
    if (sessionStore.findAllSessions().length === 0) {
      const data = await SocketModel.find();
      data.forEach((i) => {
        sessionStore.saveSession(i.sessionID, {
          userID: i.userID,
          username: i.username,
        });
      });
    }
    // find existing session
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;
      return next();
    }
  }
  const username = socket.handshake.auth.username;
  const uid = socket.handshake.auth.uid;
  if (!username) {
    return next(new Error("invalid username"));
  }

  // create new session (if not exist)
  socket.sessionID = randomBytes(8).toString("hex");
  socket.userID = uid ? uid : randomBytes(8).toString("hex");
  socket.username = username;
  next();
}
