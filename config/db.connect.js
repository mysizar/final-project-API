import mongoose from "mongoose";

// Create connection
export async function mongoConnect() {
  try {
    await mongoose.connect(process.env.DB_CONNECTIONSTRING, {
      dbName: process.env.DB_NAME,
    });
  } catch (error) {
    console.log(error.message);
  }
}

export function mongoListener() {
  mongoose.connection
    .on("error", (err) => {
      console.log("Database connection error:", err);
    })
    .on("connected", () => {
      console.log("Database connected");
    })
    .on("disconnected", () => {
      console.log("Database disconnected");
    });
}

// Close connection
export async function mongoDisconnect() {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.log("Database disconnection error:", error.message);
  }
}
