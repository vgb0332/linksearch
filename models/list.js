const mongoose = require('mongoose');
const listSchema = new mongoose.Schema({
  name: String,
  url: String,
  active : Boolean,
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt'}});

module.exports = mongoose.model('List', listSchema);
