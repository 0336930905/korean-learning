const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
  grade: { type: Number, min: 0, max: 10 },
  feedback: { type: String, default: '' }
});

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  dueDate: { type: Date },
  submissions: [submissionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
