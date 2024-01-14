const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  owner: {
    type: mongoose.ObjectId,
    required: true,
  },
  keyWords: {
    type: [String],
  },
  theme: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  qtt : {
    type: Number,
    required: true,
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
