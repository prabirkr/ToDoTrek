const mongoose = require('mongoose'); 
const userTask = require("../models/task.model.js");
const { StatusCodes } = require('http-status-codes');

// Get Task
const getTask = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        
        const tasks = await userTask.find({ userId: req.user.id })
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .exec();

        if (tasks.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'No task available! Add task.'
            });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Tasks fetched successfully',
            data: tasks
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error fetching tasks'
        });
    }
};

// Create Task
const createTask = async (req, res) => {
    try {
        const { title, todo } = req.body;
        const user = req.user;

        if (!title || !todo) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please provide all data"
            });
        }

        const task = await userTask.create({
            title,
            todo,
            userId: user.id
        });
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Task successfully created",
            task,
        });

    } catch (err) {
        console.error('Error creating task:', err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'An internal server error occurred. Please try again later.',
        });
    }
};

// Update Task
const updateTask = async (req, res) => {
    try {
        const taskId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid task ID' });
        }

        const task = await userTask.findByIdAndUpdate(taskId, req.body, { new: true, runValidators: true });

        if (!task) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Task not found' });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Task updated successfully',
            task,
        });
    } catch (error) {
        console.error('Error updating task:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

// Delete Task
const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Please enter a valid task ID!" });
        }

        const task = await userTask.findByIdAndDelete(taskId);

        if (!task) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Task not found' });
        }

        return res.status(StatusCodes.OK).json({ message: "Task deleted successfully!" });
    } catch (error) {
        console.error('Error deleting task:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Unable to delete task" });
    }
};

module.exports = { getTask, createTask, updateTask, deleteTask };
