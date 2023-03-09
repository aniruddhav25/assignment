const mongoose = require('mongoose');
const mongoDB = 'mongodb+srv://Enter-String-here';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;

module.exports = mongoose;