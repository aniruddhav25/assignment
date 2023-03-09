const mongoose = require("mongoose"); //Define a schema
const Schema = mongoose.Schema;
const MovieSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  director: {
    type: String,
    trim: true,
    required: true,
  },
  language: {
    type: String,
    trim: true,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  released_on: {
    type: Date,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
    required: true,
  },
  added_by: {
    type: String,
  },
});
module.exports = mongoose.model("Movie", MovieSchema);
