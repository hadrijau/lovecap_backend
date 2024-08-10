import express from "express";
import {
  getMatches,
  addMatch,
  deleteMatch,
  getMatchesWithUserInfos,
  deleteLastMatch,
} from "../controllers/matchController";

const matchRouter = express.Router();

matchRouter.route("/").post(addMatch);
matchRouter.route("/:id").get(getMatches).delete(deleteLastMatch);
matchRouter.route("/:id/:matchId").delete(deleteMatch);
matchRouter.route("/usersInfo/:id").get(getMatchesWithUserInfos);

export default matchRouter;
