import asyncHandler from "express-async-handler";
import Match from "../models/matchModel";

// @desc Get Stadiums
// @route GET /api/match/:id
// @access Public
const getMatches = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const matches = await Match.find({ matcher: id });
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

// @desc Create Stadium
// @route POST /api/match
// @access Public
const addMatch = asyncHandler(async (req, res) => {
  const { userId, matchId } = req.body;
  const matches = await Match.find({ matcher: userId });
  if (matches.length == 0) {
    const match = await Match.create({
      matcher: userId,
      matches: [matchId],
    });
    if (match) {
      res.status(201);
    } else {
      res.status(400);
      throw new Error("Stadium not created");
    }
  } else {
    const match = matches[0];
    const listOfMatches = match.matches;
    listOfMatches.push(matchId);
    const updatedMatch = await match.save();
    res.status(200).json(updatedMatch);
  }
});

export { getMatches, addMatch };
