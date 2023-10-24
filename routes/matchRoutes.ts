import express from "express";
import { getMatches, addMatch } from "../controllers/matchController";

const matchRouter = express.Router();

matchRouter.route("/").post(addMatch);
matchRouter.route("/:id").get(getMatches);
export default matchRouter;
