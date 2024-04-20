import bcrypt from "bcryptjs";
import { Schema, model, connect } from "mongoose";
export interface IUser {
  firstname: string;
  email: string;
  password: string;
  genre: string;
  interestedBy: string;
  dateOfBirth: Date;
  ageOfInterest: number[];
  handicap: string;
  profilePicture: string;
  expoPushToken: string;
  handicapVisible: boolean;
  compatibility: (string | boolean)[];
  numberOfLikeNotifications: number;
  maxNumberOfLike: number;
  dateWhenUserCanSwipeAgain?: Date;
  boost?: boolean;
  pictures?: string[];
  biography?: string;
}

const userSchema = new Schema<IUser>({
  firstname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  genre: { type: String, required: true },
  interestedBy: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  ageOfInterest: [0, 100],
  dateWhenUserCanSwipeAgain: { type: Date, required: false },
  handicap: { type: String, required: false },
  profilePicture: { type: String, required: true },
  handicapVisible: { type: Boolean, required: true },
  compatibility: { type: Array, required: true },
  expoPushToken: { type: String, required: true },
  numberOfLikeNotifications: { type: Number, required: true },
  boost: { type: Boolean, required: false },
  pictures: { type: Array, required: false },
  biography: { type: String, required: false },
  maxNumberOfLike: { type: Number, required: true },
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = model<IUser>("User", userSchema);

export default User;
