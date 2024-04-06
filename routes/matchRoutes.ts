import express from "express";
import {
  getMatches,
  addMatch,
  deleteMatch,
  getMatchesWithUserInfos,
} from "../controllers/matchController";

const matchRouter = express.Router();

matchRouter.route("/").post(addMatch);
matchRouter.route("/:id").get(getMatches).delete(deleteMatch);
matchRouter.route("/usersInfo/:id").get(getMatchesWithUserInfos);

export default matchRouter;
