const {
  follow_user,
  following_list,
  follower_list,
  unfollow_user,
  following_sum,
  follower_sum,
} = require("../models/followModel");
const userModel = require("../models/userModel");

const followDataValidation = async ({ followingUserId, followerUserId }) => {
  if (followerUserId?.equals(followingUserId))
    return { message: "follower and following userId is same" };
  if (followerUserId) {
    try {
      await userModel.findUserWithKey({ key: followerUserId });
    } catch (error) {
      return { message: "Invalid follower userId" };
    }
  }
  if (followingUserId) {
    try {
      await userModel.findUserWithKey({ key: followingUserId });
    } catch (error) {
      return { message: "Invalid followeing userId" };
    }
  }
};
const followUserController = async (req, res) => {
  const followerUserId = req.session.user.userId;
  const { followingUserId } = req.body;

  const errorMessage = await followDataValidation({
    followerUserId,
    followingUserId,
  });

  if (errorMessage?.message) {
    return res.send({ status: 400, message: errorMessage.message });
  }
  try {
    const followDB = await follow_user({ followerUserId, followingUserId });
    return res.send({
      status: 201,
      message: "follow successfully",
      data: followDB,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
};
//list of person we are following
const getFollowingListController = async (req, res) => {
  const followerUserId = req.session.user.userId;
  const SKIP = Number(req.query.skip) || 0;
  const errorMessage = await followDataValidation({ followerUserId });

  if (errorMessage?.message) {
    return res.send({ status: 400, message: errorMessage.message });
  }
  try {
    const followListDB = await following_list({ followerUserId, SKIP });
    if (followListDB.length === 0) {
      return res.send({
        status: 204,
        message: "no following",
      });
    }
    return res.send({
      status: 200,
      message: " follow data read successfully",
      data: followListDB,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

const getFollowerController = async (req, res) => {
  const followingUserId = req.session.user.userId;
  const SKIP = Number(req.query.skip) || 0;
  const errorMessage = await followDataValidation({ followingUserId });

  if (errorMessage?.message) {
    return res.send({ status: 400, message: errorMessage.message });
  }
  try {
    const followerListDB = await follower_list({ followingUserId, SKIP });
    if (followerListDB.length === 0) {
      return res.send({
        status: 203,
        message: "no following",
      });
    }
    return res.send({
      status: 200,
      message: " follower data read successfully",
      data: followerListDB,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

const unfollowUserController = async (req, res) => {
  const { followingUserId } = req.body;
  const followerUserId = req.session.user.userId;

  const errorMessage = await followDataValidation({ followerUserId });

  if (errorMessage?.message) {
    return res.send({ status: 400, message: errorMessage.message });
  }

  try {
    const deleteDB = await unfollow_user({ followerUserId, followingUserId });
    return res.send({
      status: 200,
      message: " unfollow user successfully",
      data: deleteDB,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
};
const getSumOfFollowingController = async (req, res) => {
  const followerUserId = req.session.user.userId;
  try {
    const followingSumDB = await following_sum({ followerUserId });
    if (followingSumDB.length === 0) {
      return res.send({
        status: 204,
        message: "0 Following",
        data: { totalFollowings: 0 },
      });
    }
    return res.send({
      status: 200,
      message: "following data got successfully",
      data: followingSumDB,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

const getSumOfFollowerController = async (req, res) => {
  const followerUserId = req.session.user.userId;
  try {
    const followerSumDB = await follower_sum({ followerUserId });
    if (followerSumDB.length === 0) {
      return res.send({
        status: 204,
        message: "0 Follower",
        data: { totalFollower: 0 },
      });
    }
    return res.send({
      status: 200,
      message: "follower data got successfully",
      data: followerSumDB,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
};
module.exports = {
  followUserController,
  getFollowingListController,
  getFollowerController,
  unfollowUserController,
  getSumOfFollowingController,
  getSumOfFollowerController,
};
