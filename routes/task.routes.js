const express = require('express');
const { createTask, getTask, updateTask, deleteTask } = require('../controllers/task.controller.js');
const { validateCreateTask, validateUpdateTask, validateDeleteTask, handleValidationErrors } = require('../middlewares/validation.js');
const userAuthentication = require('../middlewares/user.authentication.js');
const { deleteOne } = require('../models/oauth.model.js');

const router = express.Router();

router.get("/",userAuthentication,getTask);
router.post("/", validateCreateTask, handleValidationErrors,userAuthentication,createTask)
router.put("/:id",validateUpdateTask, handleValidationErrors, userAuthentication,updateTask);
router.delete("/:id",validateDeleteTask,handleValidationErrors,userAuthentication, deleteTask);

module.exports = router;