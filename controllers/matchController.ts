import asyncHandler from "express-async-handler";
import Match from "../models/matchModel";
import User, { IUser } from "../models/userModel";

// @desc Get matches
// @route GET /api/match/:id
// @access Public
const getMatches = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const matches = await Match.find({ userWhoReceivesTheLike: id });
  if (matches.length === 0) {
    res.status(200).send(matches);
  } else {
    const listOfMatches = matches[0].matches;
    if (!listOfMatches) {
      res.status(500);
    }
    res.status(200).send(listOfMatches);
  }
});

// @desc Get matches with full user infos
// @route GET /api/match/usersInfo/:id
// @access Public
const getMatchesWithUserInfos = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const matches = await Match.find({ userWhoReceivesTheLike: id });
  if (matches.length === 0) {
    res.status(200).send(matches);
  } else {
    const listOfMatches = matches[0].matches;
    if (!listOfMatches) {
      res.status(500);
    }
    let users: IUser[] = [];
    for (let match of listOfMatches) {
      const user = await User.findById(match);

      if (user) {
        users.push(user);
      }
    }
    res.status(200).send(users);
  }
});

// @desc Create Match
// @route POST /api/match
// @access Public
const addMatch = asyncHandler(async (req, res) => {
  // The userWhoGivesTheLike is the current user
  const { userWhoGivesTheLike, userWhoReceivesTheLike } = req.body;
  const matches = await Match.find({ userWhoReceivesTheLike });
  if (matches.length == 0) {
    const match = await Match.create({
      userWhoReceivesTheLike,
      matches: [userWhoGivesTheLike],
    });
    if (match) {
      res.status(201);
    } else {
      res.status(400);
      throw new Error("Match not created");
    }
  } else {
    const match = matches[0];
    const listOfMatches = match.matches;
    listOfMatches.push(userWhoGivesTheLike);
    const updatedMatch = await match.save();
    res.status(200).json(updatedMatch);
  }
});

// @desc Rewind Match
// @route DELETE /api/match
// @access Public
const deleteMatch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const matches = await Match.find({ userWhoReceivesTheLike: id });
  if (matches.length == 0) {
    res.status(400);
    throw new Error("You have no match you can't delete a match");
  } else {
    const match = matches[0];
    const listOfMatches = match.matches;
    listOfMatches.pop();
    const updatedMatch = await match.save();
    res.status(200).json(updatedMatch);
  }
});

export { getMatches, addMatch, deleteMatch, getMatchesWithUserInfos };
