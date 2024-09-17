const cron = require("node-cron");
const blogSchema = require("./schemas/blogSchema");

const cleanUpBin = () => {
  cron.schedule("* * 0 * * *", async () => {
    try {
      const markedDeletedBlog = await blogSchema.find({ isDeleted: true });

      if (markedDeletedBlog.length !== 0) {
        let deletedBlogIds = [];
        markedDeletedBlog.map((blog) => {
          const diff =
            (Date.now() - blog.deletionDateTime) / (1000 * 60 * 60 * 24);

          if (diff > 30) {
            deletedBlogIds.push(blog._id);
          }
        });
        if (deletedBlogIds.length !== 0) {
          const deleteDB = await blogSchema.findOneAndDelete({
            _id: { $in: deletedBlogIds },
          });
          console.log(`Blod has been deleted successfully: ${deleteDB._id}`);
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
};
module.exports = cleanUpBin;
