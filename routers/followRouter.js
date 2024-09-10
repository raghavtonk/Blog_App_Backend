const express = require('express');
const followRouter = express.Router();
const isAuth = require('../middlewares/isAuthMiddleware');
const { followUserController, getFollowingListController, getFollowerController, unfollowUserController, getSumOfFollowingController, getSumOfFollowerController } = require('../controllers/followController');
followRouter
.post('/follow-user',isAuth,followUserController)
.get('/follow-list',isAuth,getFollowingListController)
.get('/follower-list',isAuth,getFollowerController)
.post('/unfollow-user',isAuth,unfollowUserController)
.get('/follow-sum',isAuth,getSumOfFollowingController)
.get('/follower-sum',isAuth,getSumOfFollowerController)
module.exports = followRouter;