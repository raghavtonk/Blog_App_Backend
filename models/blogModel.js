const { LIMIT } = require("../privateConstants");
const blogSchema = require("../schemas/blogSchema");

const create_blog = ({ title, textBody, userId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const blogExist = await blogSchema.findOne({ title });
      if (blogExist) reject("Title already been used,enter another Blog title");
      else {
        const blogDB = await blogSchema.create({
          title,
          textBody,
          userId,
          creationDateTime: Date.now(),
        });
        resolve(blogDB);
      }
    } catch (error) {
      reject(error);
    }
  });
};
const get_blogs = ({ followingUserIds, SKIP }) => {
  return new Promise(async (resolve, reject) => {
    try {
      //const blogsDB = await blogSchema.find({'title':{ $not:{$regex: "^0.*"} }})// all the data from database
      //sort skip limit
      // const blogDB = await blogSchema.aggregate([
      //   { $sort: { creationDateTime: -1 } }, //-1 - desc
      //   { $skip: SKIP },
      //   { $limit: LIMIT },
      // ]);
      const followingBlogDB = await blogSchema
        .find({ userId: { $in: followingUserIds }, isDeleted: {$ne: true}})
        .populate("userId")
        .sort({ creationDateTime: -1 })
        .skip(SKIP)
        .limit(LIMIT);

      if (followingBlogDB.length > 0) {
        return resolve(followingBlogDB);
      }

      const followingBlogs = await blogSchema.find({
        userId: { $in: followingUserIds },
      });
      const blogDB = await blogSchema
        .find({ userId: { $nin: followingUserIds }, isDeleted: {$ne: true} })
        .populate("userId")
        .sort({ creationDateTime: -1 })
        .skip(SKIP - followingBlogs.length)
        .limit(LIMIT);
      return resolve(blogDB);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

const get_myBlogs = ({ SKIP, userId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const myBlogs = await blogSchema.aggregate([
        { $match: { userId , isDeleted: {$ne : true}} },
        { $sort: { creationDateTime: -1 } },
        { $skip: SKIP },
        { $limit: LIMIT },
      ]);
      resolve(myBlogs);
    } catch (error) {
      reject(error);
    }
  });
};
const findBlogById = ({ blogId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkBlogDB = await blogSchema.findOne({ _id: blogId });
      resolve(checkBlogDB);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};
const edit_blog = ({ blogId, newTitle, newTextBody }) => {
  return new Promise(async (resolve, reject) => {
    const blogExist = await blogSchema.findOne({ 
      title: newTitle, 
      _id: { $ne: blogId }
    });
    if (blogExist) reject("Title already been used,enter another Blog title");
    try {
      const prevBlogDB = await blogSchema.findOneAndUpdate(
        { _id: blogId },
        { title: newTitle, textBody: newTextBody }
      );
      resolve(prevBlogDB);
    } catch (error) {
      reject(error);
    }
  });
};
const delete_blog = ({ blogId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      // const deleteBlogDB = await blogSchema.findOneAndDelete({ _id: blogId });
      const deleteBlogDB = await blogSchema.findOneAndUpdate({_id: blogId},{isDeleted: true, deletionDateTime: Date.now()});
      resolve(deleteBlogDB);
    } catch (error) {
      reject(error);
    }
  });
};

const read_deleted_blog =({userId})=>{
  return new Promise(async(resolve,reject)=>{
    try {
      const deletedBlogDB = await blogSchema.aggregate([
        {$match: {userId, isDeleted:{$eq: true}}},
        {$sort:{deletionDateTime :-1}},
      ]);
      resolve(deletedBlogDB);
    } catch (error) {
      reject(error)
    }
  })
}

const restore_blog = ({blogId})=>{
  return new Promise(async (resolve,reject)=>{
    try {
    const restoredBlogDB = await blogSchema.findOneAndUpdate({_id: blogId},{isDeleted: false});
      resolve(restoredBlogDB);
    } catch (error) {
      reject(error);
    }
  })
}
module.exports = {
  create_blog,
  get_blogs,
  get_myBlogs,
  findBlogById,
  edit_blog,
  delete_blog,
  read_deleted_blog,
  restore_blog,
};
