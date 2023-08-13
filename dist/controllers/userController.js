"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfilePicture = exports.updateBio = exports.updateImages = exports.deleteUser = exports.getUser = exports.loginUser = exports.emailExists = exports.registerUser = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
// @desc Register User
// @route POST /api/users/register
// @access Public
const registerUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, firstname, genre, interestedBy, dateOfBirth, ageOfInterest, handicap, profilePicture, handicapVisible, } = req.body;
    const user = yield userModel_1.default.create({
        email,
        password,
        firstname,
        genre,
        interestedBy,
        dateOfBirth,
        ageOfInterest,
        handicap,
        profilePicture,
        handicapVisible,
    });
    if (user) {
        res.status(201).json({
            _id: user._id,
            email: user.email,
            token: (0, generateToken_1.default)(user._id),
        });
    }
    else {
        res.status(400);
        throw new Error("User not found");
    }
}));
exports.registerUser = registerUser;
// @desc Register User
// @route POST /api/users/emailExists
// @access Public
const emailExists = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const userExists = yield userModel_1.default.findOne({ email });
    if (userExists) {
        res.status(400).send("Cet utilisateur existe déja");
        throw new Error("User already exists");
    }
    else {
        console.log("GOES HERE");
        res.status(201).send("Cet email n'est pas utilisé");
    }
}));
exports.emailExists = emailExists;
// @desc Register User
// @route POST /api/users/login
// @access Public
const loginUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.default.findOne({ email: req.body.email });
    const secret = process.env.JWT_SECRET;
    if (!user) {
        res.status(400).send("The user not found");
        throw new Error("User not found");
    }
    if (user && bcryptjs_1.default.compareSync(req.body.password, user.password)) {
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
        }, secret, { expiresIn: "365d" });
        res.status(200).send({ user: user.email, token: token });
    }
    else {
        res.status(400).send("password is wrong!");
    }
}));
exports.loginUser = loginUser;
// @desc Update user pictures
// @route PUT /api/users/images
// @access Private
const updateImages = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id, imageUrl } = req.body;
    const user = yield userModel_1.default.findById(id);
    if (user) {
        (_a = user.pictures) === null || _a === void 0 ? void 0 : _a.push(imageUrl);
        const updatedUser = yield user.save();
        res.status(200).json(updatedUser);
    }
    else {
        res.status(404);
        throw new Error("User not found");
    }
}));
exports.updateImages = updateImages;
// @desc Update user biography
// @route PUT /api/users/biography
// @access Private
const updateBio = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, biography } = req.body;
    const user = yield userModel_1.default.findById(id);
    if (user) {
        user.biography = biography;
        const updatedUser = yield user.save();
        res.status(200).json(updatedUser);
    }
    else {
        res.status(404);
        throw new Error("User not found");
    }
}));
exports.updateBio = updateBio;
// @desc Update user biography
// @route PUT /api/users/profilePicture
// @access Private
const updateProfilePicture = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, imageUrl } = req.body;
    const user = yield userModel_1.default.findById(id);
    if (user) {
        user.profilePicture = imageUrl;
        const updatedUser = yield user.save();
        res.status(200).json(updatedUser);
    }
    else {
        res.status(404);
        throw new Error("User not found");
    }
}));
exports.updateProfilePicture = updateProfilePicture;
// @desc Get User
// @route GET /api/users/:id
// @access Public
const getUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.default.findById(req.params.id).select("-passwordHash");
    if (!user) {
        res
            .status(500)
            .json({ message: "The user with the given ID was not found." });
    }
    res.status(200).send(user);
}));
exports.getUser = getUser;
// @desc Delete user
// @route DELETE /api/users/:id
// @access Private/admin
const deleteUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.default.findById(req.params.id);
    console.log("id", req.params.id);
    if (user) {
        yield user.deleteOne();
        res.json({ message: "User removed" });
    }
    else {
        res.status(404);
        throw new Error("User not found");
    }
}));
exports.deleteUser = deleteUser;
