const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title:{
        type: String,
        required: true,
        unique: true,
        minLength: 3,
        maxLength: 100,
        trim: true,
    },
    textBody: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 1000,
        trim: true,
    },
    creationDateTime: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user", //FK to user collections
    }
});

module.exports = mongoose.model("blog",blogSchema);