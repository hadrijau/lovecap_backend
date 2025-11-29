// Charger les variables d'environnement AVANT tous les autres imports
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./config/db";
import cors from "cors";
import userRouter from "./routes/userRoutes";
import matchRouter from "./routes/matchRoutes";
import messageRouter from "./routes/messageRoutes";
import emailRouter from "./routes/emailRoutes";
import { requestLogger } from "./middleware/logger";
import { conditionalAuth } from "./middleware/conditionalAuth";

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Middleware de logging pour toutes les routes (s'exécute avant)
app.use(requestLogger);

// Middleware d'authentification conditionnelle (appliqué à toutes les routes sauf les publiques)
app.use(conditionalAuth);

app.use("/api/users", userRouter);
app.use("/api/match", matchRouter);
app.use("/api/message", messageRouter);
app.use("/api/email", emailRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`)
);
