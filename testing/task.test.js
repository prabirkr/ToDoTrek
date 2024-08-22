const mongoose = require('mongoose');
const { getTask, createTask, updateTask, deleteTask } = require('../controllers/task.controller.js');
const userTask = require('../models/task.model.js');
const { StatusCodes } = require('http-status-codes');

jest.mock('../models/task.model.js');

describe('Task Controller', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getTask', () => {
        it('should fetch tasks successfully', async () => {
            const req = {
                query: { page: 1, limit: 10 },
                user: { id: 'userId' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock query object with chainable methods
            const mockQuery = {
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([{ title: 'Task 1', todo: 'Description' }])
            };

            userTask.find.mockReturnValue(mockQuery);

            await getTask(req, res);

            expect(userTask.find).toHaveBeenCalledWith({ userId: req.user.id });
            expect(mockQuery.skip).toHaveBeenCalledWith(0);
            expect(mockQuery.limit).toHaveBeenCalledWith(10);
            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Tasks fetched successfully',
                data: [{ title: 'Task 1', todo: 'Description' }]
            });
        });

        it('should return an error if no tasks are found', async () => {
            const req = {
                query: { page: 1, limit: 10 },
                user: { id: 'userId' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock query object with chainable methods
            const mockQuery = {
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([])
            };

            userTask.find.mockReturnValue(mockQuery);

            await getTask(req, res);

            expect(userTask.find).toHaveBeenCalledWith({ userId: req.user.id });
            expect(mockQuery.skip).toHaveBeenCalledWith(0);
            expect(mockQuery.limit).toHaveBeenCalledWith(10);
            expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'No task available! Add task.'
            });
        });
    });

    describe('createTask', () => {
        it('should create a task successfully', async () => {
            const req = {
                body: {
                    title: 'New Task',
                    todo: 'Task details'
                },
                user: { id: 'userId' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            userTask.create.mockResolvedValue(req.body);

            await createTask(req, res);

            expect(userTask.create).toHaveBeenCalledWith({
                title: req.body.title,
                todo: req.body.todo,
                userId: req.user.id
            });
            expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Task successfully created',
                task: req.body
            });
        });

        it('should return an error if data is missing', async () => {
            const req = {
                body: {},
                user: { id: 'userId' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await createTask(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Please provide all data'
            });
        });
    });

    describe('updateTask', () => {
        it('should update a task successfully', async () => {
            const req = {
                params: { id: 'taskId' },
                body: { title: 'Updated Task' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
            userTask.findByIdAndUpdate.mockResolvedValue({ ...req.body, _id: req.params.id });

            await updateTask(req, res);

            expect(userTask.findByIdAndUpdate).toHaveBeenCalledWith(req.params.id, req.body, { new: true, runValidators: true });
            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Task updated successfully',
                task: { ...req.body, _id: req.params.id }
            });
        });

        it('should return an error if task ID is invalid', async () => {
            const req = {
                params: { id: 'invalidId' },
                body: { title: 'Updated Task' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);

            await updateTask(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid task ID' });
        });

        it('should return an error if task is not found', async () => {
            const req = {
                params: { id: 'taskId' },
                body: { title: 'Updated Task' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
            userTask.findByIdAndUpdate.mockResolvedValue(null);

            await updateTask(req, res);

            expect(userTask.findByIdAndUpdate).toHaveBeenCalledWith(req.params.id, req.body, { new: true, runValidators: true });
            expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
            expect(res.json).toHaveBeenCalledWith({ error: 'Task not found' });
        });
    });

    describe('deleteTask', () => {
        it('should delete a task successfully', async () => {
            const req = {
                params: { id: 'taskId' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
            userTask.findByIdAndDelete.mockResolvedValue({ _id: req.params.id });

            await deleteTask(req, res);

            expect(userTask.findByIdAndDelete).toHaveBeenCalledWith(req.params.id);
            expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(res.json).toHaveBeenCalledWith({ message: "Task deleted successfully!" });
        });

        it('should return an error if task ID is invalid', async () => {
            const req = {
                params: { id: 'invalidId' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);

            await deleteTask(req, res);

            expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
            expect(res.json).toHaveBeenCalledWith({ message: "Please enter a valid task ID!" });
        });

        it('should return an error if task is not found', async () => {
            const req = {
                params: { id: 'taskId' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
            userTask.findByIdAndDelete.mockResolvedValue(null);

            await deleteTask(req, res);

            expect(userTask.findByIdAndDelete).toHaveBeenCalledWith(req.params.id);
            expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
            expect(res.json).toHaveBeenCalledWith({ error: 'Task not found' });
        });
    });
});
