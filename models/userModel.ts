import bcrypt from "bcryptjs";
import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  firstname: string;
  email: string;
  password: string;
  genre: string;
  interestedBy: string;
  dateOfBirth: Date;
  ageOfInterest: number[];
  handicap: string;
  handicapVisible: boolean;
  profilePicture: string;
  expoPushToken: string;
  compatibility: (string | boolean)[];
  numberOfLikeNotifications: number;
  maxNumberOfLike: number;
  dateWhenUserCanSwipeAgain: Date;
  boost: boolean;
  endOfBoost: Date;
  numberOfBoostRemaining: number;
  addBoostDate: Date;
  numberOfSuperLikeRemaining: number;
  addSuperLikeDate: Date;
  pictures: string[];
  biography: string;
  notificationsEnabledNewMatch: boolean;
  notificationsEnabledNewMessage: boolean;
  notificationsEnabledSuperLike: boolean;
  notificationsEnabledPromotions: boolean;
  receivedSuperLike: boolean;
  notifications: string[];
  numberOfMessageNotifications: number;
  subscription: SubscriptionType | null;
  resetPasswordCode?: string;
  resetPasswordExpires?: Date;

  matchPassword(enteredPassword: string): Promise<boolean>;
}

enum SubscriptionType {
  ANNUAL = "annual",
  MONTHLY = "monthly",
}

const userSchema = new Schema<IUser>({
  firstname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  genre: { type: String, required: true },
  interestedBy: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  ageOfInterest: { type: [Number], required: true },
  dateWhenUserCanSwipeAgain: { type: Date },
  handicap: { type: String },
  profilePicture: { type: String, required: true },
  handicapVisible: { type: Boolean, required: true },
  compatibility: { type: [Schema.Types.Mixed], required: true },
  expoPushToken: { type: String, required: false, default: "" },
  notificationsEnabledNewMatch: { type: Boolean, required: true },
  notificationsEnabledNewMessage: { type: Boolean, required: true },
  notificationsEnabledSuperLike: { type: Boolean, required: true },
  notificationsEnabledPromotions: { type: Boolean, required: true },
  receivedSuperLike: { type: Boolean, required: true },
  numberOfLikeNotifications: { type: Number, required: true },
  boost: { type: Boolean, required: true },
  endOfBoost: { type: Date, required: false },
  numberOfBoostRemaining: { type: Number, required: false },
  addBoostDate: { type: Date, required: false },
  numberOfSuperLikeRemaining: { type: Number, required: false },
  addSuperLikeDate: { type: Date, required: false },
  pictures: { type: [String], required: true },
  biography: { type: String, required: false, default: "" },
  maxNumberOfLike: { type: Number, required: true },
  notifications: { type: [String], required: true },
  numberOfMessageNotifications: { type: Number, required: true },
  subscription: {
    type: String,
    enum: [...Object.values(SubscriptionType), null],
    required: false,
  },
  resetPasswordCode: { type: String, required: false },
  resetPasswordExpires: { type: Date, required: false },
});

// Define the matchPassword method
userSchema.methods.matchPassword = async function (
  this: IUser,
  enteredPassword: string
) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Define the pre-save hook for password hashing
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Create and export the User model
const User = model<IUser>("User", userSchema);

export default User;
