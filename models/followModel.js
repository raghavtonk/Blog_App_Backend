const { LIMIT } = require("../privateConstants");
const followSchema = require("../schemas/followSchema");
const userSchema = require("../schemas/userSchema");
const follow_user = ({ followerUserId, followingUserId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const followExist = await followSchema.findOne({
        followerUserId,
        followingUserId,
      });
      if (followExist) return reject("Already following the user.");
      const followDB = await followSchema.create({
        followerUserId,
        followingUserId,
      });
      resolve(followDB);
    } catch (error) {
      reject(error);
    }
  });
};
const following_list = ({followerUserId }) => {
  return new Promise(async (resolve, reject) => {
    try {
    // first method using populate
    //   const followDB = await followSchema
    //     .find({
    //       followerUserId,
    //     })
    //     .populate("followingUserId")
    //     .sort({ creationDateTime: -1 })
    //     .skip(SKIP)
    //     .limit(LIMIT);
    //   resolve(followDB);

      // 2nd method other then populate
      const followingList = await followSchema.aggregate([
        {$match: { followerUserId },},
        {$sort: { creationDateTime: -1 },},
      ]);

      const followingUserIdsList = followingList.map(
        (follow) => follow.followingUserId
      );

      const followingUserInfo = await userSchema.find({
        _id: { $in: followingUserIdsList },
      });
      resolve(followingUserInfo.reverse());
    } catch (error) {
      reject(error);
    }
  });
};

const follower_list = ({ followingUserId, SKIP }) => {
  return new Promise(async (resolve, reject) => {
    try {
    //   const followerListDB = await followSchema
    //     .find({
    //       followingUserId,
    //     })
    //     .populate("followerUserId")
    //     .sort({ creationDateTime: -1 })
    //     .skip(SKIP)
    //     .limit(LIMIT);

    //   resolve(followerListDB);
    const followerUserList = await followSchema.aggregate([
        {$match: { followingUserId },},
        {$sort: { creationDateTime: -1 },},
        {$skip: SKIP,},
        {$limit: LIMIT,},
      ]);

      const followerUserIdsList = followerUserList.map(
        (follow) => follow.followerUserId
      );

      const followerUserInfo = await userSchema.find({
        _id: { $in: followerUserIdsList },
      });

      resolve(followerUserInfo.reverse());
    } catch (error) {
      reject(error);
    }
  });
};

const unfollow_user = ({ followerUserId, followingUserId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const unfollowDB = await followSchema.findOneAndDelete({
        followerUserId,
        followingUserId,
      });
      resolve(unfollowDB);
    } catch (error) {
      reject(error);
    }
  });
};
const following_sum = ({followerUserId})=>{
  return new Promise(async (resolve,reject)=>{
    try {
      const followingSumDB = await followSchema.aggregate([
        {
          $match:{followerUserId},
        },
        {
          $group:{
            _id: followerUserId,
            totalFollowings:{$sum:1}
          }
        }
      ])
      resolve(followingSumDB);
    } catch (error) {
      reject(error)
    }
  })
}

const follower_sum = ({followerUserId})=>{
  return new Promise(async(resolve,reject)=>{
    try {
      const followerSumDB = await followSchema.aggregate([
        { $match: {followingUserId: followerUserId}},
        {
          $group:{
            _id: followerUserId,
            totalFollower:{$sum:1}
          }
        }
      ]);
      resolve(followerSumDB)
    } catch (error) {
      reject(error)
    }
  })
}
module.exports = { follow_user, following_list, follower_list, unfollow_user, following_sum,follower_sum };
