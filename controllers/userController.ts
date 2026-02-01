import User from "../models/userModel";
import asyncHandler from "express-async-handler";
import Match from "../models/matchModel";
import Message from "../models/messageModel";

// @desc Update User
// @route PUT /api/users/:id
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const updates = req.body;

  // Find the user by ID
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  console.log("updates", updates.subscription);
  // Update the user fields
  user.firstname = updates.firstname || user.firstname;
  user.email = updates.email || user.email;
  // Le mot de passe sera automatiquement hashé par le hook pre-save si modifié
  if (updates.password) {
    user.password = updates.password;
  }
  user.genre = updates.genre || user.genre;
  user.interestedBy = updates.interestedBy || user.interestedBy;
  user.dateOfBirth = updates.dateOfBirth || user.dateOfBirth;
  user.ageOfInterest = updates.ageOfInterest || user.ageOfInterest;
  user.handicap = updates.handicap || user.handicap;
  user.handicapVisible =
    updates.handicapVisible !== undefined
      ? updates.handicapVisible
      : user.handicapVisible;
  user.profilePicture = updates.profilePicture || user.profilePicture;
  user.expoPushToken = updates.expoPushToken || user.expoPushToken;
  user.biography =
    updates.biography != undefined ? updates.biography : user.biography;
  user.maxNumberOfLike = updates.hasOwnProperty("maxNumberOfLike")
    ? updates.maxNumberOfLike
    : user.maxNumberOfLike;
  user.dateWhenUserCanSwipeAgain =
    updates.dateWhenUserCanSwipeAgain || user.dateWhenUserCanSwipeAgain;
  user.numberOfLikeNotifications =
    updates.numberOfLikeNotifications || user.numberOfLikeNotifications;
  user.pictures = updates.pictures || user.pictures;
  user.boost = updates.boost != undefined ? updates.boost : user.boost;
  user.notificationsEnabledNewMatch =
    updates.notificationsEnabledNewMatch !== undefined
      ? updates.notificationsEnabledNewMatch
      : user.notificationsEnabledNewMatch;
  user.notificationsEnabledNewMessage =
    updates.notificationsEnabledNewMessage !== undefined
      ? updates.notificationsEnabledNewMessage
      : user.notificationsEnabledNewMessage;
  user.notificationsEnabledSuperLike =
    updates.notificationsEnabledSuperLike !== undefined
      ? updates.notificationsEnabledSuperLike
      : user.notificationsEnabledSuperLike;
  user.notificationsEnabledPromotions =
    updates.notificationsEnabledPromotions !== undefined
      ? updates.notificationsEnabledPromotions
      : user.notificationsEnabledPromotions;
  user.receivedSuperLike =
    updates.receivedSuperLike !== undefined
      ? updates.receivedSuperLike
      : user.receivedSuperLike;
  user.compatibility = updates.compatibility || user.compatibility;
  user.notifications = updates.notifications || user.notifications;
  user.numberOfMessageNotifications =
    updates.numberOfMessageNotifications || user.numberOfMessageNotifications;
  user.subscription = updates.subscription || user.subscription;
  user.endOfBoost = updates.endOfBoost || user.endOfBoost;
  user.numberOfBoostRemaining =
    updates.numberOfBoostRemaining || user.numberOfBoostRemaining;
  user.addBoostDate = updates.addBoostDate || user.addBoostDate;
  user.numberOfSuperLikeRemaining =
    updates.numberOfSuperLikeRemaining || user.numberOfSuperLikeRemaining;
  user.addSuperLikeDate = updates.addSuperLikeDate || user.addSuperLikeDate;

  // Save the updated user
  const updatedUser = await user.save();

  res.status(200).json(updatedUser);
});

// @desc Get Users for swiping
// @route GET /api/users/except/:id/:interestedBy/:ageOfInterest
// @access Private
const getUsers = asyncHandler(async (req, res) => {
  const { id, interestedBy, ageOfInterest } = req.params;

  // Vérifier que l'ID dans l'URL correspond à l'utilisateur authentifié
  if (req.user?.userId !== id) {
    res.status(403);
    throw new Error("Vous n'êtes pas autorisé à accéder à ces profils");
  }

  const [minAge, maxAge] = ageOfInterest.split("-").map(Number);

  const currentDate = new Date();
  const minDateOfBirth = new Date(
    currentDate.setFullYear(currentDate.getFullYear() - maxAge)
  );
  currentDate.setFullYear(currentDate.getFullYear() + maxAge);
  const maxDateOfBirth = new Date(
    currentDate.setFullYear(currentDate.getFullYear() - minAge)
  );

  let genreFilter = {};
  if (interestedBy === "female") {
    genreFilter = { genre: "female" };
  } else if (interestedBy === "male") {
    genreFilter = { genre: "male" };
  } else {
    genreFilter = { genre: "autre" };
  }

  const users = await User.aggregate([
    {
      $match: {
        _id: { $ne: id },
        ...genreFilter,
        dateOfBirth: { $gte: minDateOfBirth, $lte: maxDateOfBirth },
      },
    },
    { $sample: { size: 50 } },
  ]);

  if (!users) {
    res.status(500).json({ message: "The users were not found" });
  } else {
    res.status(200).send(users);
  }
});

// @desc Get User
// @route GET /api/users/:id
// @access Private
const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const authenticatedUserId = req.user?.userId;

  if (!authenticatedUserId) {
    res.status(401);
    throw new Error("Non authentifié");
  }

  // Si l'utilisateur demande son propre profil, autoriser
  if (authenticatedUserId === id) {
    const user = await User.findById(id).select("-password");
    if (!user) {
      res.status(404).json({ message: "The user with the given ID was not found." });
    } else {
      res.status(200).send(user);
    }
    return;
  }

  // Sinon, vérifier si c'est un match ou une conversation
  let hasAccess = false;

  // Vérifier si l'utilisateur authentifié a liké l'utilisateur demandé
  const matchWhereUserLiked = await Match.findOne({
    userWhoReceivesTheLike: id,
  });
  if (matchWhereUserLiked) {
    const hasLiked = matchWhereUserLiked.matches.some(
      (match) => match.userWhoGivesTheLike === authenticatedUserId
    );
    if (hasLiked) {
      hasAccess = true;
    }
  }

  // Vérifier si l'utilisateur demandé a liké l'utilisateur authentifié
  if (!hasAccess) {
    const matchWhereTargetLiked = await Match.findOne({
      userWhoReceivesTheLike: authenticatedUserId,
    });
    if (matchWhereTargetLiked) {
      const hasBeenLiked = matchWhereTargetLiked.matches.some(
        (match) => match.userWhoGivesTheLike === id
      );
      if (hasBeenLiked) {
        hasAccess = true;
      }
    }
  }

  // Vérifier s'ils ont une conversation
  if (!hasAccess) {
    const conversations = await Message.find({
      members: {
        $elemMatch: { id: authenticatedUserId },
      },
    });
    // Vérifier si l'utilisateur demandé est aussi dans une de ces conversations
    const hasConversation = conversations.some((conv) =>
      conv.members.some((member: any) => member.id === id)
    );
    if (hasConversation) {
      hasAccess = true;
    }
  }


  const user = await User.findById(id).select("-password");
  if (!user) {
    res.status(404).json({ message: "The user with the given ID was not found." });
  } else {
    res.status(200).send(user);
  }
});

// @desc Get User
// @route GET /api/users/email/:email
// @access Private
const getUserByEmail = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const user = await User.findOne({ email: email });

  if (!user) {
    res.status(404).json({ message: "The user with the given email was not found." });
    return;
  }

  // Vérifier que l'utilisateur authentifié demande son propre profil
  if (req.user?.userId !== user._id.toString()) {
    res.status(403);
    throw new Error("Vous n'êtes pas autorisé à accéder à ce profil");
  }

  // Retourner l'utilisateur sans le mot de passe
  const userObj = user.toObject();
  const { password, ...userWithoutPassword } = userObj;
  res.status(200).send(userWithoutPassword);
});

// @desc Delete user
// @route DELETE /api/users/:id
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Vérifier que l'utilisateur authentifié est le propriétaire du compte
  if (req.user?.userId !== userId) {
    res.status(403);
    throw new Error("Vous n'êtes pas autorisé à supprimer ce compte");
  }

  const user = await User.findById(userId);
  if (user) {
    await user.deleteOne();
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  updateUser,
  getUser,
  deleteUser,
  getUsers,
  getUserByEmail,
};
