const express = require('express');
const router  = express.Router();
const {
  getTasks, createTask, updateTask, deleteTask, addComment
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// All task routes require authentication
router.use(protect);

router.route('/')
  .get(getTasks)       // GET  /api/tasks
  .post(createTask);   // POST /api/tasks

router.route('/:id')
  .put(updateTask)     // PUT    /api/tasks/:id
  .delete(deleteTask); // DELETE /api/tasks/:id

router.post('/:id/comment', addComment); // POST /api/tasks/:id/comment

module.exports = router;
