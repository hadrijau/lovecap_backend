"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const userRouter = express_1.default.Router();
userRouter.route("/register").post(userController_1.registerUser);
userRouter.route("/emailExists").post(userController_1.emailExists);
userRouter.route("/login").post(userController_1.loginUser);
userRouter.route("/images").put(userController_1.updateImages);
userRouter.route("/biography").put(userController_1.updateBio);
userRouter.route("/profilePicture").put(userController_1.updateProfilePicture);
userRouter.route("/:id").get(userController_1.getUser).delete(userController_1.deleteUser);
exports.default = userRouter;
