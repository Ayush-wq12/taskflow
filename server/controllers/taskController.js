const Task = require('../models/Task');

const populate = 'name email color';

// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('creator', populate)
      .populate('assignee', populate)
      .populate('comments.user', populate)
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, desc, status, priority, assignee } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required.' });

    const task = await Task.create({
      title, desc, status, priority,
      creator: req.user._id,
      assignee: assignee || null,
    });

    const populated = await task.populate([
      { path: 'creator',       select: populate },
      { path: 'assignee',      select: populate },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    // Only creator can fully edit; assignee can change status
    const isCreator  = task.creator.toString() === req.user._id.toString();
    const isAssignee = task.assignee?.toString() === req.user._id.toString();

    if (!isCreator && !isAssignee)
      return res.status(403).json({ message: 'Not authorized to edit this task.' });

    const { title, desc, status, priority, assignee } = req.body;
    if (isCreator) {
      task.title    = title    ?? task.title;
      task.desc     = desc     ?? task.desc;
      task.priority = priority ?? task.priority;
      task.assignee = assignee !== undefined ? (assignee || null) : task.assignee;
    }
    task.status = status ?? task.status;

    await task.save();
    const populated = await task.populate([
      { path: 'creator',  select: populate },
      { path: 'assignee', select: populate },
      { path: 'comments.user', select: populate },
    ]);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (task.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the creator can delete this task.' });

    await task.deleteOne();
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/tasks/:id/comment
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required.' });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    task.comments.push({ user: req.user._id, text });
    await task.save();

    const populated = await task.populate([
      { path: 'creator',  select: populate },
      { path: 'assignee', select: populate },
      { path: 'comments.user', select: populate },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, addComment };
