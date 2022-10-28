const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: {
    type: String, 
    min: [3, "Category length is too small"],
    required: [true, "please add a category"]
    },
  // imageURL: { 
  //   type: String, 
  //   required: true 
  //   },
});

CategorySchema.virtual("url").get(function () {
    return "/inventory/categories/" + this._id;
  });

module.exports = mongoose.model("Category", CategorySchema);