const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text:    { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true, trim: true },
    desc:       { type: String, default: '', trim: true },
    status:     { type: String, enum: ['todo', 'inprogress', 'done'], default: 'todo' },
    priority:   { type: String, enum: ['low', 'medium', 'high'],      default: 'medium' },
    creator:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignee:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    comments:   [commentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
