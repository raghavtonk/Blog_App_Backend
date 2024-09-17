const ObjectId = require("mongodb").ObjectId;
const {
  create_blog,
  get_blogs,
  get_myBlogs,
  edit_blog,
  findBlogById,
  delete_blog,
  read_deleted_blog,
  restore_blog,
} = require("../models/blogModel");
const { following_list } = require("../models/followModel");
const { blogDataValidation } = require("../utils/blogUtil");

const createBlogController = async (req, res) => {
  const { title, textBody } = req.body;
  const userId = req.session.user.userId;
  try {
    await blogDataValidation({ title, textBody });
  } catch (error) {
    return res.send({ status: 400, message: "Invalid Data", error: error });
  }
  try {
    const blogDB = await create_blog({ title, textBody, userId });
    return res.send({
      status: 201,
      message: "Blog created successfully",
      data: blogDB,
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

const getBlogsController = async (req, res) => {
  let followerUserId = "";
  if (req.session.user) {
    followerUserId = req.session.user.userId;
  }
  const SKIP = Number(req.query.skip) || 0;
  try {
    const followingUserList = await following_list({ followerUserId, SKIP: 0 });
    const followingUserIds = followingUserList.map((item) => item._id);
    const blogDB = await get_blogs({ followingUserIds, SKIP });
    if (blogDB.length === 0) {
      return res.send({
        status: 204,
        message: "No Blog Found",
      });
    }
    return res.send({
      status: 200,
      message: "Blogs retrieved successfully",
      data: blogDB,
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

const getMyBlogsController = async (req, res) => {
  const SKIP = Number(req.query.skip) || 0;
  const userId = req.session.user.userId;
  try {
    const myblogsDB = await get_myBlogs({ SKIP, userId });
    if (myblogsDB.length === 0) {
      return res.send({
        status: 204,
        message: "No Blog Found",
      });
    }
    return res.send({
      status: "200",
      message: "Blogs retrieved successfully",
      data: myblogsDB,
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

const editBlogController = async (req, res) => {
  const { blogId, newTitle, newTextBody } = req.body;
  const userId = req.session.user.userId;
  //data Validation
  if (!blogId) return res.send({ status: 400, message: "missing BlogId" });
  if (!ObjectId.isValid(blogId))
    return res.send({ status: 400, message: "Incorrect format of BlogId" });
  if (typeof blogId !== "string")
    return res.send({ status: 400, message: "BlogId is not a text" });
  try {
    await blogDataValidation({ title: newTitle, textBody: newTextBody });
  } catch (error) {
    return res.send({ status: 400, message: "Invalid Data", error: error });
  }
  //findind blog by id
  try {
    const checkBlogDB = await findBlogById({ blogId });
    if (!checkBlogDB) {
      //if blog not found case
      return res.send({
        status: 400,
        message: "blog not found by id",
      });
    }
    if (!checkBlogDB.userId.equals(userId)) {
      // ownwership case
      return res.send({
        status: 403,
        message: "unauthorized user trying to edit the blog",
      });
    }
    // checking 30 mins time limit for editing blog
    const blogCreationTime = checkBlogDB.creationDateTime;
    const currentTime = Date.now();
    const diff = Math.floor((currentTime - blogCreationTime) / 60000);

    if (diff > 30) {
      return res.send({
        status: 400,
        message: "Blog cannot be edited after 30mins of creation time",
      });
    }
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
  // blog found and user valid case
  try {
    const prevBlogDB = await edit_blog({ blogId, newTitle, newTextBody });

    if (!prevBlogDB) {
      //if blog not found case
      return res.send({
        status: 400,
        message: "blog not found by id",
      });
    }
    return res.send({
      status: 200,
      message: "Blog edited successfully",
      data: prevBlogDB,
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

const deleteBlogController = async (req, res) => {
  const { blogId } = req.body;
  const userId = req.session.user.userId;

  //data Validation
  if (!blogId) return res.send({ status: 400, message: "missing BlogId" });
  if (!ObjectId.isValid(blogId))
    return res.send({ status: 400, message: "Incorrect format of BlogId" });
  if (typeof blogId !== "string")
    return res.send({ status: 400, message: "BlogId is not a text" });

  // find blog by id
  try {
    const checkBlogDB = await findBlogById({ blogId });
    if (!checkBlogDB)
      return res.send({ status: 400, message: "Blog not found by id" });
    if (!checkBlogDB.userId.equals(userId)) {
      // ownwership case
      return res.send({
        status: 403,
        message: "unauthorized user trying to delete the blog",
      });
    }
    const deleteBlogDB = await delete_blog({ blogId });
    return res.send({
      status: 200,
      message: "Blog deleted successfully",
      data: deleteBlogDB,
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

const readDeletedBlogController = async(req,res)=>{
  const userId = req.session.user.userId;

  try {
    const deletedBlogDB = await read_deleted_blog({userId});
    if(deletedBlogDB.length === 0){
      return res.send({
        status: 204,
        message: "No Deleted Blog Found",
      });
    }
    return res.send({
      status: 200,
      message: 'Deleted blogs retrieved successfully',
      data: deletedBlogDB
    })
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
}
const restoreBlogsController = async(req,res)=>{
  const { blogId } = req.body;
  const userId = req.session.user.userId;
  //data Validation
  if (!blogId) return res.send({ status: 400, message: "missing BlogId" });
  if (!ObjectId.isValid(blogId))
    return res.send({ status: 400, message: "Incorrect format of BlogId" });
  if (typeof blogId !== "string")
    return res.send({ status: 400, message: "BlogId is not a text" });

  try {
    const checkBlogDB = await findBlogById({ blogId });
    if (!checkBlogDB)
      return res.send({ status: 400, message: "Blog not found by id" });
    if (!checkBlogDB.userId.equals(userId)) {
      // ownwership case
      return res.send({
        status: 403,
        message: "unauthorized user trying to delete the blog",
      });
    }
    const restoredBlogDB = await restore_blog({ blogId });
    return res.send({
      status: 200,
      message: "Blog restored successfully",
      data: restoredBlogDB,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
}
module.exports = {
  createBlogController,
  getBlogsController,
  getMyBlogsController,
  editBlogController,
  deleteBlogController,
  readDeletedBlogController,
  restoreBlogsController,
};
