const express = require("express");
const blogRouter = express.Router();

const {
  createBlogController,
  getBlogsController,
  getMyBlogsController,
  editBlogController,
  deleteBlogController,
} = require("../controllers/blogController");
const isAuth = require("../middlewares/isAuthMiddleware");

blogRouter
  .post("/create-blog", isAuth, createBlogController)
  .get("/get-blogs", getBlogsController)
  .get("/get-myblogs", isAuth, getMyBlogsController)
  .post("/edit-blog", isAuth, editBlogController)
  .post("/delete-blog", isAuth, deleteBlogController);

module.exports = blogRouter;
