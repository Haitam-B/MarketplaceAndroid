const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  originalname: {
    type: String,
    required: true,
  },
  encoding: {
    type: String,
  },
  filename: {
    type: String,
    required: true,
    unique: true,
  },
  path: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  product: {
    type: mongoose.ObjectId,
    required: true,
  },
  isPrimary: {
    type: Boolean,
    required: true,
  }
});



const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
