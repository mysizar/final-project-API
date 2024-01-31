import { config } from "dotenv";
config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { userRouter } from "./routes/user.route.js";
import { productRouter } from "./routes/product.route.js";
import { messageRouter } from "./routes/message.route.js";
import { mongoConnect, mongoListener } from "./config/db.connect.js";
import { check } from "express-validator";
import { Server } from "socket.io";
import session from "./middlewares/message/checkSession.mdw.js";
import socketListener from "./controller/message.ctrl.js";

mongoListener();
await mongoConnect();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    origin: true,
    credentials: true,
  })
);

// Endpoints with sanitizing
app.use("/user", check("**").trim().escape(), userRouter);
app.use("/product", check("**").trim().escape(), productRouter);
app.use("/message", check("**").trim().escape(), messageRouter);
app.get("/cron", (req, res) => res.status(200).json({ status: "OK" }));

// 404-Page
app.all("*", (req, res, next) => {
  res.status(404).json({
    error: {
      code: 404,
      message: "Page not found",
    },
  });
});

// ErrorHandler
app.use((err, req, res, next) => {
  res.status(err.code || 500).json({
    error: {
      code: err.code || 500,
      message: err.message || "Server Error",
    },
  });
});

const expressServer = app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port: ${process.env.PORT}`);
});

/* -------------------------- socket server -------------------------- */

export const io = new Server(expressServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.use(session);
io.on("connection", socketListener);
