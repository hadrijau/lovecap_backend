import { Schema, model } from "mongoose";

interface IMatch {
  userWhoReceivesTheLike: string;
  matches: string[];
}

const matchSchema = new Schema<IMatch>({
  userWhoReceivesTheLike: { type: String, required: true },
  matches: { type: [String], required: true },
});

const Match = model<IMatch>("Match", matchSchema);

export default Match;
