import { Schema, model } from "mongoose";

interface IMatch {
  userWhoReceivesTheLike: string;
  matches: { userWhoGivesTheLike: string; superLike: boolean }[];
}

const matchSchema = new Schema<IMatch>({
  userWhoReceivesTheLike: { type: String, required: true },
  matches: { type: [], required: true },
});

const Match = model<IMatch>("Match", matchSchema);

export default Match;
