const express = require("express");
const blogRouter = express.Router();

const {
  createBlogController,
  getBlogsController,
  getMyBlogsController,
  editBlogController,
  deleteBlogController,
  readDeletedBlogController,
  restoreBlogsController,
} = require("../controllers/blogController");
const isAuth = require("../middlewares/isAuthMiddleware");

blogRouter
  .post("/create-blog", isAuth, createBlogController)
  .get("/get-blogs", getBlogsController)
  .get("/get-myblogs", isAuth, getMyBlogsController)
  .post("/edit-blog", isAuth, editBlogController)
  .post("/delete-blog", isAuth, deleteBlogController)
  .get('/read-deleted-blog',isAuth,readDeletedBlogController)
  .post('/restore-blog',isAuth,restoreBlogsController);
module.exports = blogRouter;
