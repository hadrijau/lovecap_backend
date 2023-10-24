import { Schema, model } from "mongoose";

interface IMatch {
  matcher: string;
  matches: string[];
}

const matchSchema = new Schema<IMatch>({
  matcher: { type: String, required: true },
  matches: { type: [String], required: true },
});

const Match = model<IMatch>("Match", matchSchema);

export default Match;
