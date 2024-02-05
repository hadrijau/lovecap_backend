import express from "express";
import connectDB from "./config/db";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./routes/userRoutes";
import matchRouter from "./routes/matchRoutes";
import messageRouter from "./routes/messageRoutes";
import path from "path";

const app = express();
dotenv.config();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/match", matchRouter);
app.use("/api/message", messageRouter);

app.use(
  "/",
  express.static(path.join(__dirname, "dist", "angular", "browser"))
);

app.use((req, res, next) => {
  res.sendFile(
    path.join(__dirname, "dist", "angular", "browser", "index.html")
  );
});
const PORT = process.env.PORT || 8000;

app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`)
);
