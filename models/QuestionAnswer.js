const mongoose = require("mongoose");

const questionsAnswers = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  data: {
    type: Array,
  },
});

module.exports = mongoose.model("QuestionAnswers", questionsAnswers);
