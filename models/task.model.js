const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required!"]
    },
    todo: {
        type: String,
        required: [true, "Todo description is required!"],
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' 
    },
    createdOn: {
        type: Date,
        default: Date.now 
    }
});

// Ensure that model name matches the collection name in MongoDB
module.exports = mongoose.model("Task", taskSchema); // Use capitalized model name for conventions
