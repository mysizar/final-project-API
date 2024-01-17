import { config } from "dotenv";
config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { userRouter } from "./routes/user.route.js";
import { mongoConnect, mongoListener } from "./config/db.connect.js";
import { productRouter } from "./routes/product.route.js";
import { check } from "express-validator";

mongoListener();
await mongoConnect();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://127.0.0.1:5173",
    credentials: true,
  })
);

// Endpoints with sanitizing
app.use("/user", check("**").trim().escape(), userRouter);
app.use("/product", check("**").trim().escape(), productRouter);
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

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port: ${process.env.PORT}`);
});
