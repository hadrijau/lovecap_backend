import express from "express";
import connectDB from "./config/db";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./routes/userRoutes";
const app = express();
dotenv.config();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRouter);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`)
);
